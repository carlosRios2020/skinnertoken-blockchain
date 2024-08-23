//
document.addEventListener('DOMContentLoaded', async function () {
    let provider;
    let signer;
    let contract;
  
    const contractAddress = '0x04fdf369dd7c9b152517369c40c8dc82647325b0'; // Reemplaza con la dirección de tu contrato
    const contractABI = [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'spender',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
        ],
        name: 'Approval',
        type: 'event',
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'address',
            name: 'from',
            type: 'address',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'spender',
            type: 'address',
          },
        ],
        name: 'allowance',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'spender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        name: 'approve',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
        ],
        name: 'balanceOf',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        name: 'transfer',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        name: 'transferFrom',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [],
        name: 'buyTokens',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'payable',
        type: 'function',
      },
    ];
  
    async function connectWallet() {
      if (typeof window.ethereum !== 'undefined') {
        try {
          provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send('eth_requestAccounts', []);
          signer = provider.getSigner();
          const address = await signer.getAddress();
          document.getElementById(
            'accountAddress'
          ).textContent = `Conectado: ${address}`;
  
          contract = new ethers.Contract(contractAddress, contractABI, signer);
          console.log('Contrato inicializado correctamente');
  
          // Guardar la dirección en localStorage
          localStorage.setItem('walletAddress', address);
        } catch (error) {
          console.error('Error al conectar MetaMask:', error);
          document.getElementById('accountAddress').textContent =
            'Error al conectar MetaMask';
        }
      } else {
        alert('MetaMask no está instalado!');
      }
    }
  
    // Verificar si ya hay una conexión previa guardada
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      await connectWallet();
    }
  
    document
      .getElementById('connectButton')
      .addEventListener('click', async () => {
        await connectWallet();
      });
  
    // El resto de los eventos para las funciones del contrato...
    document
      .getElementById('checkBalanceButton')
      .addEventListener('click', async () => {
        const address = document.getElementById('balanceAddress').value.trim();
        if (address && contract) {
          try {
            const balance = await contract.balanceOf(address);
            const decimals = 18;
            const formattedBalance = ethers.utils.formatUnits(balance, decimals);
            document.getElementById(
              'balanceResult'
            ).textContent = `Balance: ${formattedBalance} Tokens`;
          } catch (error) {
            console.error('Error al obtener el balance:', error);
            document.getElementById(
              'balanceResult'
            ).textContent = `Error al obtener el balance: ${error.message}`;
          }
        } else {
          document.getElementById('balanceResult').textContent =
            'Por favor, introduce una dirección válida y asegúrate de estar conectado.';
        }
      });
  
    document
      .getElementById('transferButton')
      .addEventListener('click', async () => {
        const recipient = document
          .getElementById('recipientAddress')
          .value.trim();
        const amount = document.getElementById('transferAmount').value.trim();
        if (recipient && amount && contract) {
          try {
            const tx = await contract.transfer(
              recipient,
              ethers.utils.parseUnits(amount, 18)
            );
            await tx.wait();
            document.getElementById(
              'transferResult'
            ).textContent = `Transferencia exitosa: ${amount} Tokens a ${recipient}`;
          } catch (error) {
            console.error('Error al realizar la transferencia:', error);
            document.getElementById(
              'transferResult'
            ).textContent = `Error: ${error.message}`;
          }
        } else {
          document.getElementById('transferResult').textContent =
            'Por favor, introduce una dirección y cantidad válida.';
        }
      });
  
    document
      .getElementById('approveButton')
      .addEventListener('click', async () => {
        const spender = document.getElementById('spenderAddress').value.trim();
        const amount = document.getElementById('approveAmount').value.trim();
        if (spender && amount && contract) {
          try {
            const tx = await contract.approve(
              spender,
              ethers.utils.parseUnits(amount, 18)
            );
            await tx.wait();
            document.getElementById(
              'approvalResult'
            ).textContent = `Aprobación exitosa de ${amount} Tokens para ${spender}`;
          } catch (error) {
            console.error('Error al aprobar los tokens:', error);
            document.getElementById(
              'approvalResult'
            ).textContent = `Error: ${error.message}`;
          }
        } else {
          document.getElementById('approvalResult').textContent =
            'Por favor, introduce una dirección y cantidad válida.';
        }
      });
  
    document
      .getElementById('checkAllowanceButton')
      .addEventListener('click', async () => {
        const owner = document.getElementById('ownerAddress').value.trim();
        const spender = document
          .getElementById('spenderAddressAllowance')
          .value.trim();
        if (owner && spender && contract) {
          try {
            const allowance = await contract.allowance(owner, spender);
            const formattedAllowance = ethers.utils.formatUnits(allowance, 18);
            document.getElementById(
              'allowanceResult'
            ).textContent = `Allowance: ${formattedAllowance} Tokens`;
          } catch (error) {
            console.error('Error al consultar el allowance:', error);
            document.getElementById(
              'allowanceResult'
            ).textContent = `Error: ${error.message}`;
          }
        } else {
          document.getElementById('allowanceResult').textContent =
            'Por favor, introduce las direcciones válidas del propietario y el gastador.';
        }
      });
  
    document
      .getElementById('totalSupplyButton')
      .addEventListener('click', async () => {
        if (contract) {
          try {
            const totalSupply = await contract.totalSupply();
            const formattedSupply = ethers.utils.formatUnits(totalSupply, 18);
            document.getElementById(
              'totalSupplyResult'
            ).textContent = `Suministro Total: ${formattedSupply} Tokens`;
          } catch (error) {
            console.error('Error al consultar el suministro total:', error);
            document.getElementById(
              'totalSupplyResult'
            ).textContent = `Error: ${error.message}`;
          }
        } else {
          document.getElementById('totalSupplyResult').textContent =
            'Error: No se pudo conectar con el contrato.';
        }
      });
  
    document
      .getElementById('buyTokensButton')
      .addEventListener('click', async () => {
        const ethAmount = document.getElementById('buyTokensAmount').value.trim();
        if (ethAmount && contract) {
          try {
            const tx = await contract.buyTokens({
              value: ethers.utils.parseEther(ethAmount),
              gasLimit: 3000000, // Ajusta este valor según sea necesario
            });
            await tx.wait();
            document.getElementById(
              'buyTokensResult'
            ).textContent = `Compra exitosa de tokens con ${ethAmount} ETH`;
          } catch (error) {
            console.error('Error al comprar tokens:', error);
  
            let errorMessage = 'Error al comprar tokens.';
            if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
              errorMessage =
                'No se pudo estimar el gas necesario. Puede que la transacción falle o requiera más gas.';
            } else if (error.code === 'CALL_EXCEPTION') {
              errorMessage =
                'La transacción falló durante la ejecución. Verifica las condiciones del contrato.';
            } else if (error.code === 'INSUFFICIENT_FUNDS') {
              errorMessage =
                'No tienes suficientes fondos para realizar la compra.';
            }
            document.getElementById(
              'buyTokensResult'
            ).textContent = `Error: ${errorMessage}`;
          }
        } else {
          document.getElementById('buyTokensResult').textContent =
            'Por favor, introduce una cantidad válida de ETH.';
        }
      });
  });
  