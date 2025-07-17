import React from "react";
import {
  Box,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Exemplo de dados — substitua por dados vindos do Firebase
const sampleData = [
  { date: "2025-06-01", weight: 80 },
  { date: "2025-06-15", weight: 78 },
  { date: "2025-07-01", weight: 77 },
  { date: "2025-07-15", weight: 76 },
];

export default function ProgressChart({ data = sampleData }) {
  const stroke = useColorModeValue("#3182CE", "#63B3ED"); // azul adaptativo

  return (
    <Box
      bg={useColorModeValue("white", "gray.700")}
      borderRadius="md"
      p={4}
      boxShadow="md"
      w="100%"
      maxW="800px"
      mx="auto"
    >
      <Heading as="h3" size="md" mb={4}>
        Progresso de Peso
      </Heading>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis unit="kg" />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke={stroke} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
