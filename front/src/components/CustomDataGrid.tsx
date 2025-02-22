import { DataGrid } from "@mui/x-data-grid";

const paginationModel = { page: 0, pageSize: 5 };

const CustomDataGrid = (props:any) => {
    const { rows, columns } = props;
    return (
        <DataGrid
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            sx={{ border: 0 }}
        />
    )
}

export default CustomDataGrid