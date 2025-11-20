export const metadata = {
  title: "AI ? Facebook Uploader",
  description: "Generate AI images and post to Facebook Page",
};

import "./globals.css";
import { PropsWithChildren } from "react";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <h1>AI ? Facebook Uploader</h1>
          <p className="badge">Vercel-ready ? Next.js 14</p>
          {children}
        </div>
      </body>
    </html>
  );
}
