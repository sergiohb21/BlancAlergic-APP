import React, { useEffect } from "react";
import Table from "./Table.tsx";
import { arrayAlergias as totalAlergias, AlergiaType } from "../const/alergias";

function InputSearch() {
  const [input, setInput] = React.useState("");
  const [arrayAlergias] = React.useState<AlergiaType[]>(totalAlergias);
  const [arrayAlergiasFiltered, setArrayAlergiasFiltered] = React.useState<AlergiaType[]>([]);

  useEffect(() => {
    const handleSearch = (inputValue: string) => {
      setArrayAlergiasFiltered(
        arrayAlergias.filter(
          (alergia) =>
            alergia.name.toLowerCase().includes(inputValue) && alergia.isAlergic
        )
      );
    };

    if (input.length > 3) {
      handleSearch(input);
    } else {
      setArrayAlergiasFiltered([]);
    }
  }, [input, arrayAlergias]);

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
      {input.length > 3 ? (
        arrayAlergiasFiltered.length > 0 ? (
          <Table listaAlergias={arrayAlergiasFiltered} />
        ) : (
          <p>Estas de suerte, Blanca no es alérgica al <strong>{input}</strong>.</p>
        )
      ) : null}
    </>
  );
}

export default InputSearch;
