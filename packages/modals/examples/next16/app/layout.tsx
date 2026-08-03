import type { Metadata } from "next";
import { ModalRoot } from "@zemd/react-modals";
import "./globals.css";

export const metadata: Metadata = {
  title: "@zemd/react-modals — Next.js 16 Example",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        {children}
        <ModalRoot />
      </body>
    </html>
  );
}
