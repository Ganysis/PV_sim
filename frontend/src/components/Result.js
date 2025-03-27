const Result = ({ data }) => {
    if (!data) return null;
  
    return (
      <div className="p-6 bg-green-100 shadow-md rounded-lg mt-4">
        <h2 className="text-lg font-bold mb-2">Résultats de la Simulation</h2>
        <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  };
  
  export default Result;
  