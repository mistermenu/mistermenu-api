import express from "express";
import { Request } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { dataProducts } from "./data/products";

const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors<Request>());
app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  res.json(products);
});

app.get("/products/:productId", async (req, res) => {
  const id = req.params.productId;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return res.status(404).json({});
  }

  return res.status(200).json(product);
});

app.post("/products/multiple", async (req, res) => {
  const product = await prisma.product.createMany({
    data: dataProducts,
    skipDuplicates: true,
  });

  return res.json(product);
});

app.post("/products", async (req, res) => {
  const product = await prisma.product.create({
    data: {
      producted: true,
      name: req.body.name ?? "No name",
      email: req.body.email ?? "No email",
    },
  });

  return res.json(product);
});

app.put("/products/:productId", async (req, res) => {
  const id = req.params.productId;
  const product = await prisma.product.update({
    where: { id },
    data: req.body,
  });

  return res.json(product);
});

app.delete("/products", async (req, res) => {
  await prisma.product.deleteMany();

  return res.send({
    status: "ok",
    message: "All products have been deleted",
  });
});

app.delete("/products/:id", async (req, res) => {
  const id = req.params.id;
  await prisma.product.delete({
    where: { id },
  });

  return res.send({
    status: "ok",
    message: `One product by id ${id} has been deleted`,
  });
});

app.get("/", async (req, res) => {
  res.send(
    `
  <h1>REST API</h1>
  <h2>Available Routes</h2>
  <pre>
    GET, POST /products
    GET, PUT, DELETE /products/:id
  </pre>
  `.trim()
  );
});

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`REST API listening at http://localhost:${port}`);
});
