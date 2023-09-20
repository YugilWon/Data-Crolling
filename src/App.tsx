import React, { useState, useEffect } from "react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { Item } from "./interface/types";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL as string,
  process.env.REACT_APP_SUPABASE_KEY as string
);

const App = () => {
  const [data, setData] = useState<Item[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/data");
        setData(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  const saveAllToSupabase = async () => {
    const itemsToInsert = data.map((item) => ({
      prodName: item.name,
      price: item.price,
      prodImg: item.img,
      prodCategory: "식품",
      prodBrand: "GS25",
      new: true,
    }));

    const { data: newItems, error } = await supabase
      .from("products")
      .insert(itemsToInsert);

    if (error) {
      console.error("Error saving to Supabase:", error);
    } else {
      console.log("Items saved to Supabase:", newItems);
    }
  };

  console.log("data", data);

  return (
    <div>
      <h1>CU</h1>
      <button onClick={saveAllToSupabase}>Save</button>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <img src={item.img} alt={item.name} />
            <h2>{item.name}</h2>
            <p>{item.price}</p>
            <p>{index + 1}</p>
            GS25
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
