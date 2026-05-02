import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

function App() {
  // ETH 状态
  const [ethAccount, setEthAccount] = useState('');
  const [ethTo, setEthTo] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [ethTxHash, setEthTxHash] = useState('');

  // SOL 状态
  const [solAccount, setSolAccount] = useState('');
  const [solTo, setSolTo] = useState('');
  const [solAmount, setSolAmount] = useState('');
  const [solTxHash, setSolTxHash] = useState('');

  // 连接 MetaMask
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert('请先安装 MetaMask！');
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    setEthAccount(accounts[0]);
  };

  // ETH 转账
  const sendETH = async () => {
    if (!ethTo || !ethAmount) {
      alert('请输入地址和金额');
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      to: ethTo,
      value: ethers.parseEther(ethAmount)
    });
    setEthTxHash(tx.hash);
    alert('ETH 交易已发送！');
  };

  // 连接 Phantom
  const connectPhantom = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert('请先安装 Phantom！');
      return;
    }
    const response = await window.solana.connect();
    setSolAccount(response.publicKey.toString());
  };

  // SOL 转账
  const sendSOL = async () => {
    if (!solTo || !solAmount) {
      alert('请输入地址和金额');
      return;
    }
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const fromPubkey = new PublicKey(solAccount);
    const toPubkey = new PublicKey(solTo);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: solAmount * LAMPORTS_PER_SOL
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const signed = await window.solana.signAndSendTransaction(transaction);
    setSolTxHash(signed.signature);
    alert('SOL 交易已发送！');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1>ETH & SOL 转账</h1>

      {/* ETH 部分 */}
      <div style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '24px', borderRadius: '8px' }}>
        <h2>ETH 转账（Sepolia）</h2>
        <button onClick={connectMetaMask}>连接 MetaMask</button>
        {ethAccount && <p>已连接：{ethAccount}</p>}
        <br />
        <input
          placeholder="收款地址 0x..."
          value={ethTo}
          onChange={e => setEthTo(e.target.value)}
          style={{ width: '100%', display: 'block', margin: '8px 0' }}
        />
        <input
          placeholder="金额 (ETH)"
          value={ethAmount}
          onChange={e => setEthAmount(e.target.value)}
          style={{ width: '200px', display: 'block', margin: '8px 0' }}
        />
        <button onClick={sendETH}>发送 ETH</button>
        {ethTxHash && (
          <p>交易 Hash：
            <a href={`https://sepolia.etherscan.io/tx/${ethTxHash}`} target="_blank" rel="noreferrer">
              {ethTxHash}
            </a>
          </p>
        )}
      </div>

      {/* SOL 部分 */}
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
        <h2>SOL 转账（Devnet）</h2>
        <button onClick={connectPhantom}>连接 Phantom</button>
        {solAccount && <p>已连接：{solAccount}</p>}
        <br />
        <input
          placeholder="收款地址"
          value={solTo}
          onChange={e => setSolTo(e.target.value)}
          style={{ width: '100%', display: 'block', margin: '8px 0' }}
        />
        <input
          placeholder="金额 (SOL)"
          value={solAmount}
          onChange={e => setSolAmount(e.target.value)}
          style={{ width: '200px', display: 'block', margin: '8px 0' }}
        />
        <button onClick={sendSOL}>发送 SOL</button>
        {solTxHash && (
          <p>交易 Hash：
            <a href={`https://explorer.solana.com/tx/${solTxHash}?cluster=devnet`} target="_blank" rel="noreferrer">
              {solTxHash}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;