import "./App.css";
import ProduitsFollowers from "./components/ProduitsFollowers";
import Insert from "./components/Insert";

function App() {
    const urllist = ["mariadb", "neo4j"];


    return (
        <>
            <div>
                <h1 className="text-3xl font-bold">Insertion</h1>
                {urllist.map((value, key: number) => (
                    <Insert key={key} base={value} />
                ))}
            </div>

            <h1 className="text-3xl font-bold">Reqêtes</h1>
            <div>
                <em>
                    1. Obtenir la liste et le nombre des produits commandés par les cercles de followers
                    d'un individu (niveau 1, ..., niveau n)  cette requête permet d'observer le rôle
                    d'influenceur d'un individu au sein du réseau social pour le déclenchement d'achats
                </em>
                {urllist.map((value, key: number) => (
                    <ProduitsFollowers key={key} base={value} />
                ))}
            </div>
            <div>
                <em>
                    2. Même requête mais avec spécification d'un produit particulier  cette requête
                    permet d'observer le rôle d'influenceur d'un individu suite à un « post » mentionnant
                    un article spécifique
                </em>
            </div>
        </>
    );
}

export default App;