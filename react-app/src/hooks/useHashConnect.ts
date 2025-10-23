/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import {
  hc,
  getHashConnectInstance,
  getInitPromise,
  getConnectedAccountIds,
} from "@/services/hashconnect";
import { useApp } from "@/contexts/AppContext";

const useHashConnect = () => {
  const {
    isConnected,
    accountId,
    isLoading,
    setConnected,
    setAccountId,
    setLoading,
  } = useApp();

  useEffect(() => {
    const setupHashConnect = async () => {
      try {
        // Wait for HashConnect to initialize
        const instance = getHashConnectInstance();
        await getInitPromise();

        // Set up event listeners
        instance.pairingEvent.on((pairingData: any) => {
          console.log("Pairing event:", pairingData);
          const accountIds = getConnectedAccountIds();
          if (accountIds && accountIds.length > 0) {
            setAccountId(accountIds[0].toString());
            setConnected(true);
          }
        });

        instance.disconnectionEvent.on(() => {
          console.log("Disconnection event");
          setConnected(false);
        });

        instance.connectionStatusChangeEvent.on((connectionStatus: any) => {
          console.log("Connection status change:", connectionStatus);
        });

        // Check if already connected
        const accountIds = getConnectedAccountIds();
        if (accountIds && accountIds.length > 0) {
          setAccountId(accountIds[0].toString());
          setConnected(true);
        }

        console.log("HashConnect setup completed");
      } catch (error) {
        console.error("HashConnect setup failed:", error);
        setLoading(false);
      }
    };

    setupHashConnect();
  }, [setAccountId, setConnected, setLoading]);

  const connect = async () => {
    setLoading(true);
    try {
      console.log("Attempting to connect to wallet...");
      const instance = getHashConnectInstance();
      await instance.openPairingModal();
    } catch (error) {
      console.error("Connection failed:", error);
      setLoading(false);
    }
  };

  const disconnect = () => {
    try {
      const instance = getHashConnectInstance();
      instance.disconnect();
      setConnected(false);
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  };

  return {
    isConnected,
    accountId,
    isLoading,
    connect,
    disconnect,
  };
};

export default useHashConnect;
