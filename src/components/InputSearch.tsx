import React, { useEffect } from "react";
import Table from "./Table.tsx";
import { arrayAlergias as totalAlergias, AlergiaType } from "../const/alergias";

function InputSearch() {
  const [input, setInput] = React.useState("");
  const [arrayAlergias] = React.useState<AlergiaType[]>(totalAlergias);
  const [isTableActive, setIsTableActive] = React.useState(false);
  const [arrayAlergiasFiltered, setArrayAlergiasFiltered] = React.useState<
    AlergiaType[]
  >([]);

  useEffect(() => {
    const handleSearch = (inputValue: string) => {
      setArrayAlergiasFiltered(
        arrayAlergias.filter(
          (alergia) =>
            alergia.name.toLowerCase().includes(inputValue) && alergia.isAlergic
        )
      );
    };
    if (input.length > 3 && !isTableActive || input.length > 3 && isTableActive) {
      handleSearch(input);
      setIsTableActive(true);
    }

    if(input.length === 0 && isTableActive) {
      handleSearch(input);
      setIsTableActive(false);
    }

  }, [input, arrayAlergias, isTableActive]);

  return (
    <>
      <div className="field label prefix suffix large border round">
        <i>search</i>
        <input
          type="text"
          onChange={(e) => setInput(e.target.value.toLocaleLowerCase())}
          value={input}
        />
        <label>Consulta un alimento</label>
      </div>
      {arrayAlergiasFiltered.length > 0 && (
        <Table listaAlergias={arrayAlergiasFiltered} />
      )}
    </>
  );
}

export default InputSearch;
