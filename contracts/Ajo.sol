// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Ajo
 * @notice Trustless rotating savings circle (tontine)
 * @dev Members contribute equal amounts each round.
 *      Each round, the full pot pays out to the next member in rotation.
 *      "Ajo" is the Yoruba word for a rotating savings circle.
 */
contract Ajo is ReentrancyGuard {
    uint256 public constant GRACE_PERIOD = 15 minutes;
    uint256 public constant LATE_FEE_BPS = 500; // 5%

    enum CircleStatus {
        Open,
        Active,
        Completed
    }

    struct Circle {
        address creator;
        uint256 contributionAmount; // amount each member pays per round (in wei)
        uint256 roundDuration; // seconds per round
        uint256 maxMembers; // total number of members
        address[] members; // ordered list of members
        uint256 currentRound; // 0-indexed current round
        uint256 roundStartTime; // timestamp when current round started
        CircleStatus status;
        mapping(uint256 => mapping(address => bool)) hasContributed; // round => member => paid
        mapping(uint256 => bool) roundPaidOut; // round => payout done
    }

    uint256 public circleCount;
    mapping(uint256 => Circle) public circles;
    mapping(uint256 => mapping(uint256 => uint256)) public roundCollected; // circleId => round => total collected

    event CircleCreated(uint256 indexed circleId, address creator, uint256 contributionAmount, uint256 maxMembers);
    event MemberJoined(uint256 indexed circleId, address member);
    event CircleStarted(uint256 indexed circleId, uint256 startTime);
    event ContributionMade(uint256 indexed circleId, uint256 round, address member);
    event LateFeePaid(uint256 indexed circleId, uint256 round, address member, uint256 feeAmount);
    event RoundPaidOut(uint256 indexed circleId, uint256 round, address recipient, uint256 amount);
    event MemberDefaulted(uint256 indexed circleId, uint256 round, address member);
    event CircleCompleted(uint256 indexed circleId);

    /// @notice Create a new savings circle
    /// @param contributionAmount Wei each member pays per round
    /// @param roundDuration Seconds per round (e.g. 604800 = 1 week)
    /// @param maxMembers Total members in the circle
    function createCircle(
        uint256 contributionAmount,
        uint256 roundDuration,
        uint256 maxMembers
    ) external returns (uint256 circleId) {
        require(contributionAmount > 0, "Contribution must be > 0");
        require(roundDuration >= 60, "Round must be >= 60 seconds");
        require(maxMembers >= 2 && maxMembers <= 20, "2-20 members allowed");

        circleId = circleCount++;
        Circle storage c = circles[circleId];
        c.creator = msg.sender;
        c.contributionAmount = contributionAmount;
        c.roundDuration = roundDuration;
        c.maxMembers = maxMembers;
        c.status = CircleStatus.Open;

        // Creator is automatically the first member
        c.members.push(msg.sender);

        emit CircleCreated(circleId, msg.sender, contributionAmount, maxMembers);
        emit MemberJoined(circleId, msg.sender);
    }

    /// @notice Join an open circle
    function joinCircle(uint256 circleId) external {
        Circle storage c = circles[circleId];
        require(c.status == CircleStatus.Open, "Circle not open");
        require(c.members.length < c.maxMembers, "Circle is full");
        require(!_isMember(circleId, msg.sender), "Already a member");

        c.members.push(msg.sender);
        emit MemberJoined(circleId, msg.sender);

        // Auto-start when full
        if (c.members.length == c.maxMembers) {
            c.status = CircleStatus.Active;
            c.roundStartTime = block.timestamp;
            emit CircleStarted(circleId, block.timestamp);
        }
    }

    /// @notice Member contributes their share for the current round
    function contribute(uint256 circleId) external payable nonReentrant {
        Circle storage c = circles[circleId];
        require(c.status == CircleStatus.Active, "Circle not active");
        require(_isMember(circleId, msg.sender), "Not a member");
        require(msg.sender != c.members[c.currentRound % c.members.length], "Recipient does not contribute this round");
        require(block.timestamp <= c.roundStartTime + c.roundDuration + GRACE_PERIOD, "Contribution window closed");
        require(!c.hasContributed[c.currentRound][msg.sender], "Already contributed this round");

        uint256 requiredAmount = c.contributionAmount;
        if (block.timestamp > c.roundStartTime + c.roundDuration) {
            uint256 lateFee = (c.contributionAmount * LATE_FEE_BPS) / 10_000;
            requiredAmount += lateFee;
            emit LateFeePaid(circleId, c.currentRound, msg.sender, lateFee);
        }

        require(msg.value == requiredAmount, "Wrong contribution amount");

        c.hasContributed[c.currentRound][msg.sender] = true;
        roundCollected[circleId][c.currentRound] += msg.value;
        emit ContributionMade(circleId, c.currentRound, msg.sender);

        // Auto-trigger payout if all required contributors have paid (recipient is exempt)
        if (_allRequiredContributed(circleId)) {
            _payout(circleId);
        }
    }

    /// @notice Anyone can trigger payout once round duration has passed and all contributed
    function triggerPayout(uint256 circleId) external nonReentrant {
        Circle storage c = circles[circleId];
        require(c.status == CircleStatus.Active, "Circle not active");
        require(!c.roundPaidOut[c.currentRound], "Round already paid out");
        require(block.timestamp >= c.roundStartTime + c.roundDuration, "Round not ended yet");
        require(_allRequiredContributed(circleId), "Not all required contributors paid");
        _payout(circleId);
    }

    /// @notice Resolve a stalled round by removing non-contributors after grace period, then pay out collected funds
    function resolveLateRound(uint256 circleId) external nonReentrant {
        Circle storage c = circles[circleId];
        require(c.status == CircleStatus.Active, "Circle not active");
        require(!c.roundPaidOut[c.currentRound], "Round already paid out");
        require(block.timestamp > c.roundStartTime + c.roundDuration + GRACE_PERIOD, "Grace period not ended");

        uint256 removed = _removeNonContributors(circleId);
        require(removed > 0, "No defaulters");

        if (c.members.length == 0) {
            c.status = CircleStatus.Completed;
            emit CircleCompleted(circleId);
            return;
        }

        _payout(circleId);
    }

    function _payout(uint256 circleId) internal {
        Circle storage c = circles[circleId];
        uint256 round = c.currentRound;
        require(!c.roundPaidOut[round], "Already paid out");
        require(c.members.length > 0, "No members");

        // Recipient is the member at index = current round (rotation)
        address recipient = c.members[round % c.members.length];
        uint256 pot = roundCollected[circleId][round];

        c.roundPaidOut[round] = true;
        roundCollected[circleId][round] = 0;

        // Transfer pot to recipient
        if (pot > 0) {
            (bool success, ) = payable(recipient).call{value: pot}("");
            require(success, "Payout failed");
        }

        emit RoundPaidOut(circleId, round, recipient, pot);

        // Advance to next round or complete the circle
        if (c.members.length < 2 || round + 1 >= c.members.length) {
            c.status = CircleStatus.Completed;
            emit CircleCompleted(circleId);
        } else {
            c.currentRound = round + 1;
            c.roundStartTime = block.timestamp;
        }
    }

    function _removeNonContributors(uint256 circleId) internal returns (uint256 removedCount) {
        Circle storage c = circles[circleId];
        uint256 round = c.currentRound;
        uint256 i = 0;
        address recipient = c.members[round % c.members.length];

        while (i < c.members.length) {
            address member = c.members[i];
            if (member != recipient && !c.hasContributed[round][member]) {
                emit MemberDefaulted(circleId, round, member);
                _removeMemberAt(c.members, i);
                removedCount++;
            } else {
                i++;
            }
        }
    }

    function _removeMemberAt(address[] storage members, uint256 index) internal {
        uint256 last = members.length - 1;
        for (uint256 i = index; i < last; i++) {
            members[i] = members[i + 1];
        }
        members.pop();
    }

    /// @notice Get full circle state for frontend
    function getCircleState(uint256 circleId)
        external
        view
        returns (
            address creator,
            uint256 contributionAmount,
            uint256 roundDuration,
            uint256 maxMembers,
            address[] memory members,
            uint256 currentRound,
            uint256 roundStartTime,
            uint8 status,
            address nextRecipient,
            uint256 contributorsThisRound
        )
    {
        Circle storage c = circles[circleId];
        creator = c.creator;
        contributionAmount = c.contributionAmount;
        roundDuration = c.roundDuration;
        maxMembers = c.maxMembers;
        members = c.members;
        currentRound = c.currentRound;
        roundStartTime = c.roundStartTime;
        status = uint8(c.status);
        nextRecipient = c.members.length > 0 ? c.members[c.currentRound % c.members.length] : address(0);

        uint256 count = 0;
        address recipient = c.members.length > 0 ? c.members[c.currentRound % c.members.length] : address(0);
        for (uint256 i = 0; i < c.members.length; i++) {
            if (c.members[i] != recipient && c.hasContributed[c.currentRound][c.members[i]]) count++;
        }
        contributorsThisRound = count;
    }

    /// @notice Check if an address has contributed in the current round
    function hasContributed(uint256 circleId, address member) external view returns (bool) {
        Circle storage c = circles[circleId];
        return c.hasContributed[c.currentRound][member];
    }

    function _isMember(uint256 circleId, address addr) internal view returns (bool) {
        Circle storage c = circles[circleId];
        for (uint256 i = 0; i < c.members.length; i++) {
            if (c.members[i] == addr) return true;
        }
        return false;
    }

    function _allRequiredContributed(uint256 circleId) internal view returns (bool) {
        Circle storage c = circles[circleId];
        address recipient = c.members[c.currentRound % c.members.length];
        for (uint256 i = 0; i < c.members.length; i++) {
            if (c.members[i] == recipient) continue;
            if (!c.hasContributed[c.currentRound][c.members[i]]) return false;
        }
        return true;
    }
}
