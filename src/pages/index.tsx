import { type NextPage } from "next";
import Head from "next/head";
import { ethers } from "ethers";

import { api } from "~/utils/api";

import {
  useAccount,
  useContractRead,
  usePrepareSendTransaction,
  useSendTransaction,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useWaitForAATransaction } from "@zerodevapp/wagmi";

import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useWallet } from "~/contexts/Wallet";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const { mutateAsync: testAddressPublic } =
    api.example.addressTestPublic.useMutation();

  const { mutateAsync: testAddressProtected } =
    api.example.addressTestProtected.useMutation();

  const { address: addressWallet } = useAccount();

  const { isEnableServerSIWE, setIsEnableServerSIWE } = useWallet();

  const { data: balanceUSDC } = useContractRead({
    address: "0xbe49ac1EadAc65dccf204D4Df81d650B50122aB2",
    abi: [
      "function balanceOf(address account) external view returns (uint256)",
    ],
    functionName: "balanceOf",
    args: [addressWallet],
  });

  const { config } = usePrepareContractWrite({
    address: "0xbe49ac1EadAc65dccf204D4Df81d650B50122aB2", // dummy contract to force deploy
    abi: [
      "function mint(address account, uint256 amount) public returns (bool)",
    ],
    functionName: "mint",
    args: [addressWallet, ethers.utils.parseEther("1")],
    // enabled: addressWallet === undefined,
  });
  const { data, writeAsync: forceDeploy } = useContractWrite({
    ...config,
    onSuccess: () => {
      console.log("SENT!!!");
    },
  });
  useWaitForAATransaction({
    wait: data?.wait,
    onSuccess: () => {
      console.log("DONE!!!");
    },
  });

  //   const { config } = usePrepareSendTransaction({
  //     request: {
  //       to: ethers.constants.AddressZero,
  //       value: ethers.utils.parseEther("0.001"),
  //     },
  //   });

  //   const { data, isLoading, isSuccess, sendTransaction } = useSendTransaction({
  //     ...config,
  //     onSuccess: () => {
  //       console.log("SENT!!!");
  //     },
  //   });
  //   useWaitForAATransaction({
  //     wait: data?.wait,
  //     onSuccess: () => {
  //       console.log("DONE!!!");
  //     },
  //   });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div>
          {addressWallet} | is server auth: {isEnableServerSIWE ? "yes" : "no"}
        </div>
        <br />
        <div>{balanceUSDC?.toString()}</div>
        <ConnectButton />
        <button
          // eslint-disable-next-line
          onClick={async () => {
            const addr = await testAddressPublic?.();
            console.log("ADDR public", addr);
          }}
        >
          test public
        </button>
        <br />
        <button
          // eslint-disable-next-line
          onClick={async () => {
            const addr = await testAddressProtected?.();
            console.log("ADDR protected", addr);
          }}
        >
          test protected
        </button>
        <br />
        {/* <button
          onClick={() => {
            setIsEnableServerSIWE(true);
          }}
        >
          enable server auth
        </button>
        <button
          onClick={() => {
            setIsEnableServerSIWE(false);
          }}
        >
          disable server auth
        </button> */}
        <br />
        <button
          disabled={!forceDeploy}
          // eslint-disable-next-line
          onClick={async () => {
            if (!forceDeploy) return;
            // eslint-disable-next-line
            await forceDeploy?.();
          }}
        >
          force deploy
        </button>
      </div>
    </>
  );
};

export default Home;
