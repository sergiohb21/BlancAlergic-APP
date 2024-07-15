import { useEffect, useState } from "react";
import { arrayAlergias, AlergiaType } from "./const/alergias";

function TableView(): JSX.Element {
  const [alergias, setAlergias] = useState<AlergiaType[]>([]);
  const [orderBy, setOrderBy] = useState<keyof AlergiaType>('name');
  const [orderAsc, setOrderAsc] = useState(true);

  useEffect(() => {
    setAlergias(arrayAlergias.filter((alergia) => alergia.isAlergic));
  }, []);

  const handleSort = (field: keyof AlergiaType) => {
    if (field === orderBy) {
      setOrderAsc(!orderAsc);
    } else {
      setOrderBy(field);
      setOrderAsc(true);
    }
  };

  const sortedAlergias = alergias.slice().sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return orderAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return orderAsc ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    }
  });

  return (
    <table className="stripes">
      <thead>
        <tr>
          <th onClick={() => handleSort('name')}>Nombre</th>
          <th onClick={() => handleSort('intensity')}>Intensidad</th>
          <th onClick={() => handleSort('category')}>Categoría</th>
          <th onClick={() => handleSort('KUA_Litro')}>KUA/L</th>
        </tr>
      </thead>
      <tbody>
        {sortedAlergias.map((alergia, index) => (
          <tr key={index}>
            <td>{alergia.name}</td>
            <td>{alergia.intensity}</td>
            <td>{alergia.category}</td>
            <td>{alergia.KUA_Litro}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th>Nombre</th>
          <th>Intensidad</th>
          <th>Categoría</th>
          <th>KUA/L</th>
        </tr>
      </tfoot>
    </table>
  );
}

export default TableView;
