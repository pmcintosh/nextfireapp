import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "@next/font/google";
import toast from "react-hot-toast";
import styles from "@/styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div>
      <button
        className="btn-blue"
        onClick={() => toast.success("hello toast!")}
      >
        Toast Me
      </button>
    </div>
  );
}
