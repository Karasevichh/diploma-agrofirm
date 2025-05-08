import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/dashboard.module.scss';
import eco from '../img/ecology.svg'
import agro from '../img/agriculture.svg'
import stat from '../img/smartFarm.svg'
import expns from '../img/financial.svg'

export default function Home() {
  return (
    <div className={styles.containerMain}>
      <div className={styles.containerMainHeader}>
        <h1>Добро пожаловать в систему АгроФирма Победа</h1>
        <p>Выберите нужный раздел:</p>
      </div>
      <div className={styles.containerMainBtns}>
        <Link href="/dashboard">
          <button>
            <Image src={eco} alt="" />
            <p>Панель управления</p>
          </button>
        </Link>
        <Link href="/resources">
          <button>
            <Image src={agro} alt="" />
            <p>Планирование ресурсов</p>
          </button>
        </Link>
        <Link href="/statistics">
          <button>
            <Image src={stat} alt="" />
            <p>Статистика</p>
          </button>
        </Link>
        <Link href="/expenses">
          <button>
            <Image src={expns} alt="" />
            <p>Затраты</p>
          </button>
        </Link>
      </div>
    </div>
  );
}
