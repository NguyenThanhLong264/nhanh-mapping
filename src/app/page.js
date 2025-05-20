'use client';
import ConditionForm from "../components/Form/ConditionForm";
import styles from "./styles.module.css";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ConditionForm />
      </main>
    </div>
  );
}