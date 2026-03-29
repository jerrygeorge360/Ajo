import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { motion } from "framer-motion";
import { CreateCircle } from "./components/CreateCircle";
import { CircleDashboard } from "./components/CircleDashboard";
import { CircleBrowser } from "./components/CircleBrowser";
import { Scene3D } from "./components/Scene3D";
import { useCircleCount } from "./hooks/useAjo";
import logo from "../public/logo.svg";
import "./App.css";

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: circleCount } = useCircleCount();
  const [viewCircleId, setViewCircleId] = useState<number>(0);

  return (
    <div className="app-container">
      <Scene3D />

      <motion.header
        className="app-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="nav-logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={logo} alt="Ajo Logo" width={58} height={58} />
        </motion.div>
        <div className="header-content">
          <motion.div
            className="header-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            POWERED BY FLOW EVM
          </motion.div>

          <motion.h1
            className="app-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Ajo
          </motion.h1>

          <motion.p
            className="app-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            The world's oldest savings tradition, reimagined with blockchain
            technology
          </motion.p>

          <motion.div
            className="live-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            aria-label="Live updates enabled"
          >
            <span className="live-dot" />
            <span>REAL-TIME UPDATES</span>
          </motion.div>
        </div>

        {/* <div className="hero-image-container">
          <img 
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80" 
            alt="Community savings" 
            className="hero-image"
          />
        </div> */}
      </motion.header>

      {!isConnected ? (
        <motion.div
          className="connect-wallet-section"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <div className="connect-card card">
            <h2>Connect Your Wallet</h2>
            <p className="connect-description">
              Join the decentralized savings circle on Flow EVM Testnet
            </p>
            <div className="connector-buttons">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="btn btn-primary btn-large"
                >
                  <span className="btn-icon">🔗</span>
                  Connect {connector.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="wallet-info"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="wallet-badge">
              <span className="wallet-icon">👛</span>
              <span className="wallet-address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            <button
              onClick={() => disconnect()}
              className="btn btn-secondary btn-small"
            >
              Disconnect
            </button>
          </motion.div>

          <div className="content-grid">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <CreateCircle />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <CircleBrowser onSelectCircle={setViewCircleId} />
            </motion.div>

            {circleCount && Number(circleCount) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <CircleDashboard circleId={viewCircleId} />
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
