import Link from 'next/link';
import styles from '../styles/dashboard.module.scss';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Добро пожаловать в систему АгроФирма Победа</h1>
      <p>Выберите нужный раздел:</p>
      <Link href="/dashboard">
        <button>Панель управления</button>
      </Link>
      <Link href="/resources">
        <button>Планирование ресурсов</button>
      </Link>
      <Link href="/statistics">
        <button>Статистика</button>
      </Link>
      <Link href="/expenses">
        <button>Затраты</button>
      </Link>
    </div>
  );
}
