import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatEther } from "viem";
import { Donation } from "../data/types";

export default function DonationsTable({ donations }: { donations: Donation[] }) {
    return (
        <Table>
            <TableCaption>A list of recent donations for this campaign.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Donator</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead className="text-right">Block</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {donations.map((donation) => (
                    <TableRow key={donation.txHash}>
                        <TableCell>
                            <a
                                href={`https://sepolia.etherscan.io/address/${donation.donator}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {donation.donator.slice(0, 6)}...{donation.donator.slice(-4)}
                            </a>
                        </TableCell>

                        <TableCell>{formatEther(donation.amount)} ETH</TableCell>

                        <TableCell>
                            <a
                                href={`https://sepolia.etherscan.io/tx/${donation.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Tx
                            </a>
                        </TableCell>

                        <TableCell className="text-right">
                            <a
                                href={`https://sepolia.etherscan.io/block/${donation.blockNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                #{String(donation.blockNumber)}
                            </a>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}