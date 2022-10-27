import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef,useState } from "react";
import web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home () {

  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // create a reference to the web3 modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
 
  /**
   * publicMint: Mint an NFT
   */
  const publicMint = async () => {
    try {
      console.log("Public Mint");
      // we need a signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // create a new instance of the contract with a signer, whichh allows update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the LW3Punks
      const tx = await nftContract.mint({
        // value signifies the cost of one LW3Punks which is "0.01" eth 
        // we are parsing '0.01' string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      //wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("you succesfully minted a LW3Punks fuck yeah!");
    } catch(err){
      console.error(err);
    }
  };

  /**
   * connectWallet: connects the MetaMask wallet
   */
  const connectWallet = async () => {
    try{
      // Get the provider from web3Modal, which in our case is MetaMask, when used
      // for thefirst time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch(err) {
      console.error(err);
    }
  };

  
    /**
     * getTokenIdsMinted: gets the number of tokenIds that have been minted
     */
    const getTokenIdsMinted = async () => {
      try {
        // get the provider from web3Modal, which in our case is MetaMask
        // no need for the signer here, as we are only reading state from the blockchain
        const provider = await getProviderOrSigner();
        // we connect to the Contract using a provider, so we will only
        // have read-only acces to the contract
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
        // call the tokenIds from the contract
        const _tokenIds = await nftContract.tokenIds();
        console.log("tokenIds", _tokenIds);
        // _tokenIds is a 'Big Number'. we need to convert the BigNumber to a string
        setTokenIdsMinted(_tokenIds.toString());
      } catch(err) {
          console.error(err);
      }
    };

    /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

    const getProviderOrSigner = async (needSigner = false) => {
      // connect to Metamask
      // since we store 'web3modal' as a reference,we need to acces the 'current' value to get access to the 
      // underlying object
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      // if user is not connected to the mumbai network, let them know and throw an error
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 80001){
        window.alert("Changue the network to mumbai");
        throw new Error("Changue network to Mumbai");
      }

      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
        return web3Provider;
    };

    //useEffect are used to react to changes in state of the website
    // the array at the end of function call represents what state changes will trigger this effect
    // in this case, whenever the value of 'walletConnected' changes - this effect will be called
    useEffect(() => {
      // if wallet is not connected, create a new instance of web3Modal and connect the MetaMask wallet
      if (!walletConnected){
        // assign the web3Modal class to the reference object by setting it's 'current' value
        // the 'current' value is persisted through as long as this page is open
        web3ModalRef.current = new web3Modal({
          network:"mumbai",
          providerOptions: {},
          disableInjectedProvider: false,
        });

        connectWallet();

        getTokenIdsMinted();

        // set an interval to get the number of token Ids minted every 5 seconds
        setInterval(async function () {
          await getTokenIdsMinted();
        }, 5*1000);
      }
    }, [walletConnected])

    const renderButton = () => {
      // if wallet is not connected, return a button which allows them to connect their wallet
      if (!walletConnected) {
        return (
          <button onClick={connectWallet} className={styles.button}>
            Connect your wallet
          </button>
        );
      }

      // if we are currently waiting gor something, return a Loading button
      if (loading) {
        return <button className={styles.button}>Loading...</button>;
      }

      return (
        <button className={styles.button} onClick={publicMint}>
          Public MInt 🚀
        </button>
      );     
    };

    return(
      <div>
        <Head>
          <title>LW3Punks</title>
          <meta name="description" content="LW3Punks-Dapp"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to LW3Punks!</h1>
            <div className={styles.description}>
              It's and NFT collection for learnweb3 students.
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/10 have been minted
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="./LW3Punks/1.png" />
          </div>
        </div>

        <footer className={styles.footer}>Made with &#10084; by LW3Punks</footer>
      </div>
    );
  }
  
