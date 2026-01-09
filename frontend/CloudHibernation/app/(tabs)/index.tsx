import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";

const API_URL = "http://172.16.104.63:8000";

type ApiResponse = {
  vm_name?: string;
  machine_type?: string;
  vcpus?: number;
  memory_gb?: number;
  region?: string;
  hours_per_day?: number;
  estimated_monthly_cost_inr?: number;
  note?: string;
  error?: string;
};

export default function App() {
  const [requestBody, setRequestBody] = useState<string>(
    `{
  "vm_name": "vm-1",
  "hours_per_day": 3
}`
  );

  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const executeRequest = async (): Promise<void> => {
    try {
      setLoading(true);
      setResponse("");

      const parsedBody = JSON.parse(requestBody);

      const res = await fetch(`${API_URL}/chatbot/estimate-cost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedBody),
      });

      const data: ApiResponse = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponse("❌ Error:\n" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Swagger-style API Demo</Text>

      <Text style={styles.label}>POST /chatbot/estimate-cost</Text>

      <Text style={styles.subLabel}>Request Body (JSON)</Text>
      <TextInput
        style={styles.codeBox}
        multiline
        value={requestBody}
        onChangeText={setRequestBody}
        textAlignVertical="top"
        placeholder='{
  "vm_name": "vm-1",
  "hours_per_day": 3
}'
        placeholderTextColor="#888"
      />

      <Button
        title={loading ? "Executing..." : "Execute"}
        onPress={executeRequest}
      />

      <Text style={styles.subLabel}>Response</Text>
      <TextInput
        style={[styles.codeBox, styles.responseBox]}
        multiline
        editable={false}
        value={response}
        placeholder="Response will appear here"
        placeholderTextColor="#888"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },
  subLabel: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "600",
    color: "#000",
  },
  codeBox: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    padding: 10,
    minHeight: 140,
    color: "#000",          // 🔑 makes typed text visible
    backgroundColor: "#f9f9f9",
    fontSize: 14,
    marginBottom: 10,
  },
  responseBox: {
    minHeight: 180,
  },
});
