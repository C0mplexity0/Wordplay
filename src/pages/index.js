import Head from "next/head";
import styles from "@/styles/index.module.css";
import Link from "next/link";

const games = [{"name": "Professionator", "href": "/game/professionator"}];

export default function Home() {
  return (
    <>
      <Head>
        <title>Wordplay</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} theme-playful`}>
        <h1 className={styles.title}>Wordplay</h1>
        
        <div className={styles["game-links"]}>
          {games.map((game, index) => <GameLink game={game} index={index} key={index} />)}
        </div>
      </main>
    </>
  )
}

function GameLink({ game, index }) {
  var sideClassName = styles["game-link-left"];

  if (index % 2 == 0) {
    sideClassName = styles["game-link-right"];
  }

  var delay = index * 0.05;

  return (
    <Link href={game.href} className={`${styles["game-link"]} ${sideClassName}`} style={{animationDelay: delay + "s"}}>
      <h2 className={styles["game-name"]}>{game.name}</h2>
    </Link>
  )
}
