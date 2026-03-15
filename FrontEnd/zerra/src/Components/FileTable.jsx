import * as React from "react";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
    { field: 'fileName', headerName: 'File Name', width: 70 },
    { field: 'owner', headerName: 'Owner', width: 70 },
];

const paginationModel = { page: 0, pageSize: 5 };

function FileTable() {
  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={props.rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}

export default FileTable