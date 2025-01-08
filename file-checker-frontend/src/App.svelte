<script>
    import axios from "axios";
    import { onMount } from "svelte";

    let file = null;
    let result = null;
    let filterText = '';
    let sortColumn = '';
    let sortDirection = 'asc';
    let currentPage = 1;
    const rowsPerPage = 10;

    const handleFileChange = (event) => {
        file = event.target.files[0];
    };

    const uploadFile = async () => {
        if (!file) {
            alert("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            console.log('Uploading file...');
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            result = response.data;
            console.log('File uploaded successfully', result);
            currentPage = 1; // Reset page after upload
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file");
        }
    };

    const filterData = (data) => {
        if (!filterText) return data;
        return data.filter(entry =>
            Object.values(entry).some(value =>
                value.toString().toLowerCase().includes(filterText.toLowerCase())
            )
        );
    };

    const sortData = (data) => {
        if (!sortColumn) return data;
        return [...data].sort((a, b) => {
            if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
            if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
    };

    const totalPages = (data) => {
        return Math.ceil(data.length / rowsPerPage);
    };

    const getPaginatedData = (data) => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return data.slice(start, end);
    };

    const nextPage = () => {
        if (result && currentPage < totalPages(filterData(result.duplicates))) {
            currentPage += 1;
        }
    };

    const prevPage = () => {
        if (result && currentPage > 1) {
            currentPage -= 1;
        }
    };

    $: paginatedDuplicates = getPaginatedData(sortData(filterData(result?.duplicates || [])));
    $: paginatedNewEntries = getPaginatedData(sortData(filterData(result?.newEntries || [])));
</script>

<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f9;
        margin: 0;
        padding: 0;
    }

    .app-bar {
        background-color: #007bff;
        color: #fff;
        padding: 10px 20px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
    }

    .container {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
    }

    th {
        background-color: #007bff;
        color: white;
        cursor: pointer;
    }

    .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    button {
        padding: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        background: #007bff;
        color: white;
    }

    button:disabled {
        background: grey;
    }
</style>

<div class="app-bar">File Checker</div>

<div class="container">
    <h1>File Checker</h1>
    <input type="file" on:change="{handleFileChange}" />
    <button on:click="{uploadFile}">Upload</button>

    {#if result}
        <h2>Results</h2>
        <input type="text" placeholder="Search..." bind:value="{filterText}" />

        <div>
            <h3>Duplicates</h3>
            {#if paginatedDuplicates.length > 0}
                <table>
                    <thead>
                        <tr>
                            <th on:click={() => handleSort('task_id')}>Task ID</th>
                            <th on:click={() => handleSort('task_type')}>Task Type</th>
                            <th on:click={() => handleSort('work_package')}>Work Package</th>
                            <th on:click={() => handleSort('completed_date')}>Completed Date</th>
                            <th on:click={() => handleSort('total_length')}>Total Length</th>
                            <th on:click={() => handleSort('qa_approved')}>QA Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each paginatedDuplicates as duplicate (duplicate.task_id)}
                            <tr>
                                <td>{duplicate.task_id}</td>
                                <td>{duplicate.task_type}</td>
                                <td>{duplicate.work_package}</td>
                                <td>{duplicate.completed_date}</td>
                                <td>{duplicate.total_length}</td>
                                <td>{duplicate.qa_approved}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div class="pagination">
                    <button on:click={prevPage} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {totalPages(result.duplicates)}</span>
                    <button on:click={nextPage} disabled={currentPage >= totalPages(result.duplicates)}>Next</button>
                </div>
            {:else}
                <p>No duplicates found.</p>
            {/if}
        </div>
    {/if}
</div>
