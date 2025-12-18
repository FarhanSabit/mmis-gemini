// QR Receipt Component (src/components/payments/digital-receipt.tsx)



"use client";



import { QRCodeSVG } from "qrcode.react"; // Standard QR library

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Download, Share2 } from "lucide-react";



interface ReceiptProps {

  transaction: {

    id: string;

    amount: number;

    date: string;

    stallCode: string;

    vendorName: string;

  };

}



export function DigitalReceipt({ transaction }: ReceiptProps) {

  const receiptData = JSON.stringify({

    tid: transaction.id,

    stall: transaction.stallCode,

    amt: transaction.amount,

  });



  return (

    <Card className="w-full max-w-sm mx-auto border-t-4 border-t-green-600">

      <CardHeader className="text-center">

        <CardTitle className="text-lg">Payment Confirmed</CardTitle>

        <p className="text-2xl font-bold">UGX {transaction.amount.toLocaleString()}</p>

      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">

        <div className="p-4 bg-white rounded-lg shadow-inner">

          <QRCodeSVG value={receiptData} size={180} level="H" />

        </div>

        <div className="w-full space-y-2 text-sm">

          <div className="flex justify-between"><span className="text-muted-foreground">Stall:</span> <span>{transaction.stallCode}</span></div>

          <div className="flex justify-between"><span className="text-muted-foreground">ID:</span> <span className="font-mono">{transaction.id.slice(0, 8)}</span></div>

        </div>

      </CardContent>

      <CardFooter className="flex gap-2">

        <Button variant="outline" className="flex-1" onClick={() => window.print()}>

          <Download className="w-4 h-4 mr-2" /> Save

        </Button>

        <Button variant="outline" className="flex-1">

          <Share2 className="w-4 h-4 mr-2" /> Share

        </Button>

      </CardFooter>

    </Card>

  );

}