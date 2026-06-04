import BackButton from "@/components/BackButton";
import "./message.css";

export default function Komunikat() {

  return (
    <main>
      <BackButton />
        <div className="container-comunikat">
            
            <div className="text-comunikat">
                <h1>NIE MOŻNA WYPOŻYCZYĆ TEJ POZYCJI</h1>
                <p>Aktualnie dana pozycja jest niedostępna. Sprawdzaj dostępność na bieżąco i spróbuj gdy tylko pozycja będzie dostępna!</p>
            </div>
        </div>
    </main>
  );
}