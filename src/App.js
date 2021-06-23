import RelayerCharts from "./Charts.js";

let paths = [
  {
    path: "cosmos-osmosis",
    heading: "Cosmos-Osmosis Relayer"
  }, {
    path: "akash-osmosis",
    heading: "Akash-Osmosis Relayer"
  }, {
    path: "sentinel-osmosis",
    heading: "Sentinel-Osmosis Relayer"
  }, {
    path: "core-osmosis",
    heading: "Persistence-Osmosis Relayer"
  }, {
    path: "crypto-osmosis",
    heading: "Crypto.Org-Osmosis Relayer"
  }, {
    path: "iris-osmosis",
    heading: "Iris-Osmosis Relayer"
  }
]

function App() {
  return (
    <div>
      {
        paths.map((path) => {
          return (<>
            <h3 style={{ textAlign: "center" }}>{path.heading}</h3>
            <RelayerCharts path={path.path} />
            <br />
          </>)
        })
      }
    </div>
  );
}

export default App;
