<script>
	import axios from "axios";
	import { onMount } from "svelte";
  
	let file = null;
	let result = { duplicates: [], newEntries: [] };
	let filterText = '';
	let sortColumn = '';
	let sortDirection = 'asc';
  
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
		const response = await axios.post("http://localhost:5000/upload", formData, {
		  headers: { "Content-Type": "multipart/form-data" }
		});
		result = response.data;
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
  
	h1 {
	  text-align: center;
	  color: #333;
	}
  
	h2, h3 {
	  color: #555;
	}
  
	input[type="file"] {
	  display: block;
	  margin: 20px auto;
	}
  
	button {
	  display: block;
	  margin: 20px auto;
	  padding: 10px 20px;
	  background-color: #007bff;
	  color: #fff;
	  border: none;
	  border-radius: 4px;
	  cursor: pointer;
	}
  
	button:hover {
	  background-color: #0056b3;
	}
  
	table {
	  width: 100%;
	  border-collapse: collapse;
	  margin-top: 20px;
	}
  
	th, td {
	  border: 1px solid #ddd;
	  padding: 8px;
	  text-align: left;
	}
  
	th {
	  background-color: #007bff;
	  color: #fff;
	  cursor: pointer;
	}
  
	tr:nth-child(even) {
	  background-color: #f2f2f2;
	}
  
	tr:hover {
	  background-color: #ddd;
	}
  
	.no-data {
	  text-align: center;
	  color: #888;
	}
  
	.filter-input {
	  display: block;
	  margin: 20px auto;
	  padding: 10px;
	  width: 80%;
	  max-width: 400px;
	  border: 1px solid #ddd;
	  border-radius: 4px;
	}
  </style>
  
  <div class="app-bar">
	ReRender
  </div>
  
  <div class="container">
	<h1>File Checker</h1>
	<input type="file" on:change="{handleFileChange}" />
	<button on:click="{uploadFile}">Upload</button>
  
	{#if result}
	  <h2>Results</h2>
	  <input type="text" class="filter-input" placeholder="Filter results..." bind:value="{filterText}" />
  
	  <div>
		<h3>Duplicates</h3>
		{#if filterData(result.duplicates).length > 0}
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
			  {#each sortData(filterData(result.duplicates)) as duplicate}
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
		{:else}
		  <p class="no-data">No duplicates found.</p>
		{/if}
	  </div>
	  <div>
		<h3>New Entries</h3>
		{#if filterData(result.newEntries).length > 0}
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
			  {#each sortData(filterData(result.newEntries)) as entry}
				<tr>
				  <td>{entry.task_id}</td>
				  <td>{entry.task_type}</td>
				  <td>{entry.work_package}</td>
				  <td>{entry.completed_date}</td>
				  <td>{entry.total_length}</td>
				  <td>{entry.qa_approved}</td>
				</tr>
			  {/each}
			</tbody>
		  </table>
		{:else}
		  <p class="no-data">No new entries found.</p>
		{/if}
	  </div>
	{/if}
  </div>