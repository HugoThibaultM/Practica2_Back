import express from "express"
import axios from "axios"
import cors from "cors"

const app = express()

const port = 3000

app.use(cors())

app.use((express.json()))

type LD = {
id: number
filmName: string
rotationType: "CAV" | "CLV",
region: string,
lengthMinutes: number,
videoFormat: "NTSC" | "PAL"
}

let discos: LD[] = [
    { id: 1, filmName: "Star Wars", rotationType: "CAV", region: "USA", lengthMinutes: 112, videoFormat:"NTSC" },
    { id: 2, filmName: "Transformers", rotationType: "CLV", region: "France", lengthMinutes: 219, videoFormat:"PAL" },
    { id: 3, filmName: "Maze runner", rotationType: "CAV", region: "USA", lengthMinutes: 301, videoFormat:"PAL" },
]

app.get("/ld", (_req, res)=>{
    res.status(200).json(discos)
})


app.get("/ld/:id", (req, res) => {
    const Id = Number(req.params.id)

    const encontrado = discos.find((elem) => elem.id === Id)

    return encontrado
        ? res.status(200).json(encontrado)
        : res.status(404).json("No se ha encontrado el id")

})

app.post("/ld", (req, res) => {
    try {
        const newId = Date.now()
        const newFilmName = req.body.filmName
        const newRotationType = req.body.rotationType
        const newRegion = req.body.region
        const newLengthMinutes = req.body.lengthMinutes
        const newVideoFormat = req.body.videoFormat

        if(!newFilmName || !newRotationType || !newRegion || !newLengthMinutes || !newVideoFormat){
            return res.status(400).send("Error: se necesitan todos los parametros")
        }

        if(newFilmName===""||newRegion===""){
            return res.status(400).send("Error: no se permite strings vacios")
        }

        if (newRotationType.toUpperCase()!= "CAV" && newRotationType.toUpperCase()!="CLV") {
            return res.status(400).send("rotationType no es válida")
        }

        if (newVideoFormat.toUpperCase()!= "NTSC" && newVideoFormat.toUpperCase()!="PAL") {
            return res.status(400).send("videoFormat no es válida")
        }

        const newLD: LD = {
            id: newId,
            ...req.body
        }

        if (newFilmName && newRotationType && newRegion && newLengthMinutes && newVideoFormat && typeof (newFilmName) === "string" && typeof (newRegion) === "string" && typeof (newLengthMinutes) === "number") {

            discos.push(newLD)
            res.status(201).json(discos)
        } else {
            res.status(404).send("Hay algo mal")
        }


    } catch (err: any) {
        res
            .status(500)
            .json({ error: "Error al crear", detail: err.message });

    }
})

app.delete("/ld/:id", (req, res) => {
    try {
        const existe = discos.find((elem) => elem.id === Number(req.params.id));
        if (!existe) {
            return res.json("Peli no encontrada");
        }

        discos = discos.filter((elem) => elem.id !== Number(req.params.id));

        res.json({ message: "Peli eliminada con exito ", discos });
    } catch (err: any) {
        res.status(500).json({ err: "Error al eliminarlo" })
    }
});

app.put("/ld/:id", (req, res) => {
  const id = Number(req.params.id)
  const { filmName, rotationType, region, lengthMinutes, videoFormat } = req.body

  const index = discos.findIndex((elem) => elem.id === id)
  if (index === -1) {
    return res.status(404).json({ error: "No se ha encontrado el disco que quieres actualizar" })
  }

  if (filmName && (typeof filmName !== "string")) {
    return res.status(400).send("El nombre no es válido")
  }
  if (rotationType && rotationType !== "CAV" && rotationType !== "CLV") {
    return res.status(400).send("rotationType no es válida")
  }
  if (region && (typeof region !== "string")) {
    return res.status(400).send("La región no es válida")
  }
  if(filmName===""||region===""){
    return res.status(400).send("Error: no se permite strings vacios")
  }

  discos[index] = { ...discos[index], ...req.body }

  res.status(200).json({
    message: "Disco actualizado correctamente",
    disco: discos[index],
  })
})

const testApi = async () => {

    try {

        const resAll = (await axios.get<LD[]>("http://localhost:3000/ld")).data
        console.log("GET ALL LD ", resAll)

        const resTeamId = (await axios.get<LD>("http://localhost:3000/ld/1")).data
        console.log("GET  LD ", resTeamId)

        const resPost = (await axios.post<LD[]>("http://localhost:3000/ld", {
            filmName: "Divergente",
            rotationType: "CAV",
            region: "USA",
            lengthMinutes: 200,
            videoFormat:"NTSC"
        })).data

        console.log("POST LD ", resPost)

        const resPut = (await axios.put<LD[]>("http://localhost:3000/ld/1", {
            filmName: "Dexter",
            rotationType: "CAV",
            region: "USA",
            lengthMinutes: 100,
            videoFormat:"NTSC"
        })).data

        console.log("PUT LD ", resPut)


        const resDelete = (await axios.delete<LD[]>("http://localhost:3000/ld/2")).data
        console.log("Delete ld ", resDelete)


    } catch (err) {

        if (axios.isAxiosError(err)) {
            console.log("Error en peticion:", err.message);
        } else {
            console.log("Error global:", err);
        }

    }

}

setTimeout(() => { testApi() }, 1000)

app.listen(port, () => console.log(`Conectado al puerto ${port}`))