
"use client";

import { useState } from "react";

const analyticsOptions = [
    {
        id: "q1",
        name: "Gate conflicts",
        description: "Find flights assigned to the same gate during overlapping time intervals."
    },
    {
        id: "q2",
        name: "Flight relationships",
        description: "Explore the nodes and relationships connected to a selected flight."
    },
    {
        id: "q3",
        name: "Crew roster",
        description: "View crew members and their assigned roles for a flight."
    },
    {
        id: "q4",
        name: "Passengers and baggage",
        description: "Trace passengers to their bookings, seats and baggage."
    },
    {
        id: "q5",
        name: "Delay impact",
        description: "Identify delayed flights, their reasons and affected passengers."
    },
    {
        id: "q6",
        name: "Aircraft utilisation",
        description: "Find aircraft associated with multiple flights."
    },
    {
        id: "q7",
        name: "Gate utilisation",
        description: "Count flight assignments for gates at each airport."
    }
];

const buttonStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border, #d1d5db)",
    background: "var(--card, #ffffff)",
    color: "inherit",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600
};

function displayValue(value) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
}

export default function Neo4jAnalytics() {
    const [selectedQuery, setSelectedQuery] = useState("q1");
    const [flightNo, setFlightNo] = useState("AI101");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [executed, setExecuted] = useState(false);

    const selectedOption = analyticsOptions.find(
        (option) => option.id === selectedQuery
    );

    const needsFlight = ["q2", "q3", "q4"].includes(selectedQuery);

    async function runAnalytics() {
        if (needsFlight && !flightNo.trim()) {
            setError("Enter a flight number first.");
            return;
        }

        setLoading(true);
        setError("");
        setData([]);
        setExecuted(false);

        try {
            const params = new URLSearchParams({
                query: selectedQuery
            });

            if (needsFlight) {
                params.set("flightNo", flightNo.trim().toUpperCase());
            }

            const response = await fetch(
                `/api/neo4j/analytics?${params.toString()}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Unable to run the Neo4j query."
                );
            }

            setData(result.data || []);
            setExecuted(true);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    function renderGraphResult() {
        if (!data.length) {
            return <p>No connected graph data was found.</p>;
        }

        const graph = data[0];
        const nodes = graph.nodes || [];
        const relationships = graph.relationships || [];

        const nodeNames = {};

        nodes.forEach((node) => {
            const properties = node.properties || {};
            nodeNames[node.id] =
                properties.number ||
                properties.name ||
                properties.code ||
                properties.reg ||
                properties.number ||
                node.labels?.[0] ||
                "Node";
        });

        return (
            <div style={{ display: "grid", gap: "20px" }}>
                <div>
                    <h3 style={{ marginBottom: "10px" }}>
                        Connected nodes ({nodes.length})
                    </h3>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "10px"
                        }}
                    >
                        {nodes.map((node) => (
                            <div
                                key={node.id}
                                style={{
                                    border: "1px solid var(--border, #d1d5db)",
                                    borderRadius: "9px",
                                    padding: "12px",
                                    background: "var(--card, #ffffff)"
                                }}
                            >
                                <strong>
                                    {node.labels?.join(" / ") || "Node"}
                                </strong>

                                {Object.entries(node.properties || {}).map(
                                    ([key, value]) => (
                                        <div
                                            key={key}
                                            style={{
                                                fontSize: "12px",
                                                marginTop: "5px",
                                                overflowWrap: "anywhere"
                                            }}
                                        >
                                            <span style={{ opacity: 0.65 }}>
                                                {key}:{" "}
                                            </span>
                                            {displayValue(value)}
                                        </div>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 style={{ marginBottom: "10px" }}>
                        Relationships ({relationships.length})
                    </h3>

                    {relationships.length ? (
                        <div style={{ display: "grid", gap: "8px" }}>
                            {relationships.map((rel) => (
                                <div
                                    key={rel.id}
                                    style={{
                                        padding: "10px 12px",
                                        border: "1px solid var(--border, #d1d5db)",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                        overflowWrap: "anywhere"
                                    }}
                                >
                                    <strong>
                                        {nodeNames[rel.startNode] || "Node"}
                                    </strong>
                                    {"  →  "}
                                    <span style={{ fontWeight: 700 }}>
                                        {rel.type}
                                    </span>
                                    {"  →  "}
                                    <strong>
                                        {nodeNames[rel.endNode] || "Node"}
                                    </strong>

                                    {Object.keys(rel.properties || {}).length > 0 && (
                                        <div style={{ marginTop: "5px", opacity: 0.7 }}>
                                            {Object.entries(rel.properties).map(
                                                ([key, value]) => (
                                                    <span key={key}>
                                                        {key}: {displayValue(value)}{" "}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No relationships found.</p>
                    )}
                </div>
            </div>
        );
    }

    function renderTable() {
        if (!data.length) {
            return <p>No records found for this query.</p>;
        }

        const columns = Object.keys(data[0]);

        return (
            <div style={{ overflowX: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column}>
                                    {column.replaceAll("_", " ")}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                {columns.map((column) => (
                                    <td key={column}>
                                        {displayValue(row[column])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <section className="panel">
            <div style={{ marginBottom: "18px" }}>
                <h2>Neo4j Graph Analytics</h2>
                <p style={{ opacity: 0.7, marginTop: "5px" }}>
                    Explore airport operations using graph relationships and Cypher queries.
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "10px",
                    marginBottom: "18px"
                }}
            >
                {analyticsOptions.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                            setSelectedQuery(option.id);
                            setData([]);
                            setError("");
                            setExecuted(false);
                        }}
                        style={{
                            ...buttonStyle,
                            textAlign: "left",
                            borderColor:
                                selectedQuery === option.id
                                    ? "#2563eb"
                                    : "var(--border, #d1d5db)",
                            background:
                                selectedQuery === option.id
                                    ? "rgba(37, 99, 235, 0.10)"
                                    : "var(--card, #ffffff)"
                        }}
                    >
                        {option.id.toUpperCase()} · {option.name}
                    </button>
                ))}
            </div>

            <div
                style={{
                    padding: "14px",
                    borderRadius: "9px",
                    background: "var(--card, #ffffff)",
                    border: "1px solid var(--border, #d1d5db)",
                    marginBottom: "15px"
                }}
            >
                <h3>{selectedOption.name}</h3>
                <p style={{ opacity: 0.7, marginTop: "5px", fontSize: "13px" }}>
                    {selectedOption.description}
                </p>

                {needsFlight && (
                    <div style={{ marginTop: "14px" }}>
                        <label
                            htmlFor="neo4j-flight"
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontSize: "13px",
                                fontWeight: 600
                            }}
                        >
                            Flight number
                        </label>

                        <input
                            id="neo4j-flight"
                            value={flightNo}
                            onChange={(event) => setFlightNo(event.target.value)}
                            placeholder="e.g. AI101"
                            style={{
                                padding: "10px",
                                borderRadius: "7px",
                                border: "1px solid var(--border, #d1d5db)",
                                width: "100%",
                                maxWidth: "260px",
                                background: "var(--card, #ffffff)",
                                color: "inherit"
                            }}
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={runAnalytics}
                    disabled={loading}
                    style={{
                        ...buttonStyle,
                        marginTop: "14px",
                        background: "#2563eb",
                        color: "#ffffff",
                        borderColor: "#2563eb",
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? "Running query..." : "Run Neo4j Query"}
                </button>
            </div>

            {error && (
                <p
                    role="alert"
                    style={{
                        color: "#dc2626",
                        padding: "10px",
                        borderRadius: "7px",
                        background: "rgba(220, 38, 38, 0.08)"
                    }}
                >
                    {error}
                </p>
            )}

            {loading && <p>Fetching results from Neo4j...</p>}

            {executed && !loading && (
                <div style={{ marginTop: "18px" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginBottom: "12px"
                        }}
                    >
                        <h3>Query results</h3>
                        <span style={{ opacity: 0.65, fontSize: "13px" }}>
                            {selectedQuery.toUpperCase()} · {data.length} result row(s)
                        </span>
                    </div>

                    {selectedQuery === "q2"
                        ? renderGraphResult()
                        : renderTable()}
                </div>
            )}
        </section>
    );
}
