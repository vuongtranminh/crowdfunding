Tạo contract Crowdfunding

Tạo ví MetaMask: https://metamask.io/

Thêm ví vào Chrome

Tạo ví mới => Sử dụng cụm từ khôi phục bí mật => Thêm thông tin mật khẩu
Lưu cụm từ bí mật: 
| Cột 1 | Cột 2 | Cột 3 |
| :--- | :--- | :--- |
| 1. guilt | 2. usual | 3. derive |
| 4. action | 5. panel | 6. afraid |
| 7. repeat | 8. speak | 9. stage |
| 10. olympic | 11. harvest | 12. heavy |

Mở vào ví

Vào Mạng => Scroll xuống dưới => Bật Hiển thị các mạng thử nghiệm 

Dưới tab token => Đổi Tất cả mạng phổ biến => Tab Custom => Chọn Sepolia

Vào Sepolia Foucet Chain Link để nhận ETH: https://faucets.chain.link/sepolia
Chọn Ethereum Sepolia => Chọn Connect => I accept => MetaMask => Chọn account connect => Kết nối => Thành công
Sau khi connect thành công bên dưới có 2 Faucets selected => Continute => Sẽ thấy nhận 0.5 ETH và 25 LINK vào địa chỉ ví account đã kết nối vừa xong => Get tokens => Qua ví bấm Xác nhận chữ ký => Nhận được 25 LINK nhưng không nhận được ETH vì yêu cầu phải có 1 LINK ví thật (Chống spam)

Nhận ETH ở Google Cloud Web3 Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
Selected Network: Ethereum Sepolia
Wallet address or ENS name: Lấy địa chỉ ví của mình
Khi xong sẽ có thông tin:
Get 0.05 Sepolia ETH
Transaction complete! Check your wallet address
Network: Ethereum Sepolia
Recipient: 0x36325c203762D7D660160f26b44feFD5E9F15a99
Transaction hash: 0x9dac77128f70aa0c9032e7151231b6736a69f43a0981ac9de0f0c1844bce7258

Để kiểm tra giao dịch có thể xem trên: sepolia etherscan: Chọn Sepolia Testnet => Tìm địa chỉ ví mình sẽ thấy giao dịch 0.05 ETH vừa nhận

Để ví hiển thị ETH thay vì US$ thì vào Cài đặt => Chung => Tiền tệ => Chọn ETH

Sử dụng private_key ví của mình để ký giao dịch (trả phí gas, deploy contract)

Cài extendtion solidity để code sol => config Solidity: Formatter chọn forge, Solidity: Linter chọn solium
Dùng bộ công cụ Foundry để phát triển Smart Contract: https://getfoundry.sh/

# Download foundry installer `foundryup`
curl -L https://foundry.paradigm.xyz | bash
# Install forge, cast, anvil, chisel
foundryup


# Start anvil with 10 pre-funded accounts
anvil

Tất cả các dữ liệu transaction được lưu ở dạng hex. chuyển qua dạng decimal để xem

Muốn kết nối reactjs ví metamask vào metamask xem doc để kết nối

deploy lên chain
Cần có RPC URL: dùng Infura hoặc Alchemy: Ở đây dùng Alchemy


ReentrancyGuard là contract bảo vệ chống tấn công re-entrancy
→ một trong lỗ hổng nguy hiểm nhất trong Ethereum
🔥 DAO hack 2016 – mất 3.6 triệu ETH

dùng https://docs.openzeppelin.com/contracts/5.x để bảo mật
https://docs.openzeppelin.com/contracts/4.x/api/security