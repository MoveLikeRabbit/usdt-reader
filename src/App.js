import React, { useState } from 'react';
import { ethers } from 'ethers';
import { USDT_ADDRESS, USDT_ABI } from './config';

function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [txList, setTxList] = useState([]);
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('请先安装 MetaMask！');
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    setAccount(accounts[0]);

    const contract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
    const raw = await contract.balanceOf(accounts[0]);
    const decimals = await contract.decimals();
    setBalance(ethers.formatUnits(raw, decimals));

    const filter = contract.filters.Transfer();
    const events = await contract.queryFilter(filter, -1000);
    setTxList(events.slice(-10).reverse());
  };

  const sendUSDT = async () => {
    if (!toAddress || !amount) {
      alert('请输入地址和金额');
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
    const decimals = await contract.decimals();
    const tx = await contract.transfer(
      toAddress,
      ethers.parseUnits(amount, decimals)
    );
    setTxHash(tx.hash);
    alert('交易已发送，等待确认...');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>USDT 链上数据读取</h1>
      <button onClick={connectWallet}>连接钱包</button>
      {account && <p>钱包地址：{account}</p>}
      {balance !== '' && <p>USDT 余额：{balance}</p>}

      <hr />
      <h2>发送 USDT</h2>
      <input
        placeholder='收款地址 0x...'
        value={toAddress}
        onChange={e => setToAddress(e.target.value)}
        style={{ width: '400px', display: 'block', margin: '8px 0' }}
      />
      <input
        placeholder='金额'
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={{ width: '200px', display: 'block', margin: '8px 0' }}
      />
      <button onClick={sendUSDT}>发送</button>
      {txHash && (
        <p>
          交易 Hash：
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target='_blank'
            rel='noreferrer'
          >
            {txHash}
          </a>
        </p>
      )}

      <hr />
      {txList.length > 0 && (
        <div>
          <h2>最近转账记录</h2>
          {txList.map((tx, i) => (
            <div
              key={i}
              style={{
                border: '1px solid #ccc',
                margin: '8px',
                padding: '8px',
              }}
            >
              <p>Hash：{tx.transactionHash}</p>
              <p>From：{tx.args[0]}</p>
              <p>To：{tx.args[1]}</p>
              <p>Amount：{ethers.formatUnits(tx.args[2], 6)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
