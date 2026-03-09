import { ethers } from "hardhat";
import { expect } from "chai";
import { Ajo } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Ajo", () => {
  async function deployAjo() {
    const [alice, bob, carol] = await ethers.getSigners();
    const AjoFactory = await ethers.getContractFactory("Ajo");
    const ajo = (await AjoFactory.deploy()) as unknown as Ajo;
    return { ajo, alice, bob, carol };
  }

  it("creates a circle and auto-starts when full", async () => {
    const { ajo, alice, bob, carol } = await deployAjo();
    const contribution = ethers.parseEther("0.1");
    const week = 7 * 24 * 60 * 60;

    await ajo.connect(alice).createCircle(contribution, week, 3);
    await ajo.connect(bob).joinCircle(0);
    await ajo.connect(carol).joinCircle(0);

    const state = await ajo.getCircleState(0);
    expect(state.status).to.equal(1);
    expect(state.members.length).to.equal(3);
  });

  it("all non-recipients contribute -> auto-payout to first member", async () => {
    const { ajo, alice, bob, carol } = await deployAjo();
    const contribution = ethers.parseEther("0.1");
    const week = 7 * 24 * 60 * 60;

    await ajo.connect(alice).createCircle(contribution, week, 3);
    await ajo.connect(bob).joinCircle(0);
    await ajo.connect(carol).joinCircle(0);

    const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);

    await ajo.connect(bob).contribute(0, { value: contribution });
    await ajo.connect(carol).contribute(0, { value: contribution });

    const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
    expect(aliceBalanceAfter).to.be.gt(aliceBalanceBefore);
  });

  it("round advances after payout", async () => {
    const { ajo, alice, bob, carol } = await deployAjo();
    const contribution = ethers.parseEther("0.1");
    const week = 7 * 24 * 60 * 60;

    await ajo.connect(alice).createCircle(contribution, week, 3);
    await ajo.connect(bob).joinCircle(0);
    await ajo.connect(carol).joinCircle(0);

    await ajo.connect(bob).contribute(0, { value: contribution });
    await ajo.connect(carol).contribute(0, { value: contribution });

    const state = await ajo.getCircleState(0);
    expect(state.currentRound).to.equal(1);
    expect(state.nextRecipient).to.equal(bob.address);
  });

  it("completes circle after all rounds", async () => {
    const { ajo, alice, bob } = await deployAjo();
    const contribution = ethers.parseEther("0.1");
    const week = 7 * 24 * 60 * 60;

    await ajo.connect(alice).createCircle(contribution, week, 2);
    await ajo.connect(bob).joinCircle(0);

    await ajo.connect(bob).contribute(0, { value: contribution });

    await ajo.connect(alice).contribute(0, { value: contribution });

    const state = await ajo.getCircleState(0);
    expect(state.status).to.equal(2);
  });

  it("charges late fee after round duration", async () => {
    const { ajo, alice, bob } = await deployAjo();
    const contribution = ethers.parseEther("0.1");
    const roundSeconds = 60;
    const lateFee = (contribution * 500n) / 10_000n;

    await ajo.connect(alice).createCircle(contribution, roundSeconds, 2);
    await ajo.connect(bob).joinCircle(0);

    await time.increase(roundSeconds + 1);

    await expect(ajo.connect(alice).contribute(0, { value: contribution })).to.be.revertedWith(
      "Recipient does not contribute this round"
    );
    await expect(ajo.connect(bob).contribute(0, { value: contribution })).to.be.revertedWith("Wrong contribution amount");

    const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);

    await ajo.connect(bob).contribute(0, { value: contribution + lateFee });

    const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
    expect(aliceBalanceAfter - aliceBalanceBefore).to.equal(contribution + lateFee);
  });

  it("removes defaulters after grace period and advances", async () => {
    const { ajo, alice, bob, carol } = await deployAjo();
    const contribution = ethers.parseEther("0.1");
    const roundSeconds = 60;

    await ajo.connect(alice).createCircle(contribution, roundSeconds, 3);
    await ajo.connect(bob).joinCircle(0);
    await ajo.connect(carol).joinCircle(0);

    // Carol defaults in round 0; alice is recipient so only bob/carol are expected to pay
    await ajo.connect(bob).contribute(0, { value: contribution });

    await time.increase(roundSeconds + 15 * 60 + 1);
    await ajo.resolveLateRound(0);

    const state = await ajo.getCircleState(0);
    expect(state.members.length).to.equal(2);
    expect(state.members[0]).to.equal(alice.address);
    expect(state.members[1]).to.equal(bob.address);
    expect(state.currentRound).to.equal(1);
    expect(state.nextRecipient).to.equal(bob.address);
  });
});
