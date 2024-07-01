import { AlergiaType } from "../const/alergias";

interface TableProps {
  listaAlergias: AlergiaType[];
}

function Table({ listaAlergias }: TableProps): JSX.Element {
  return (
    <>
      <table className="table-auto">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Intensidad</th>
            <th>Categoria</th>
          </tr>
        </thead>
        <tbody>
          {listaAlergias?.map((alergia, index) => (
            <tr key={index}>
              <td>{alergia?.name}</td>
              <td>{alergia?.intensity}</td>
              <td>{alergia?.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
export default Table;
