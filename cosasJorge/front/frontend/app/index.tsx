import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";


type Pokemon = { name: string, url: string };
type PokeResponse = { results: Pokemon[] };

export default function Index() {

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
        const data: PokeResponse = await response.json();
        console.log("Pokemons cargados:", data.results);
        setPokemons(data.results);
      } catch (error) {
        console.error("Error al cargar pokemons", error);
      }

    };
    fetchPokemons();
  }, []);
  const [pokemon, setPokemons] = useState<Pokemon[]>([]);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Listado de Pokemons</Text>
      <FlatList
        data={pokemon}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 18, padding: 6 }}>{item.name}</Text>
        )}
      />


    </View>
  );
}