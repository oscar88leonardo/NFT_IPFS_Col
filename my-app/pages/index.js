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

}