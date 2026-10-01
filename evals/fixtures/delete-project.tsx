// fails: compiles, lint:external-imports, renders
// A delete action from another UI kit, which the project does not install.
import { Button } from "@mui/material"

export default function DeleteProject() {
  return <Button color="error">Delete project</Button>
}
