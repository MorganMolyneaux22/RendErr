<script>
	import axios from "axios";
  
	let file = null;
	let result = null;
  
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
	  } catch (error) {
		console.error("Error uploading file:", error);
		if (error.response) {
		  console.error("Response data:", error.response.data);
		  console.error("Response status:", error.response.status);
		  console.error("Response headers:", error.response.headers);
		} else if (error.request) {
		  console.error("Request data:", error.request);
		} else {
		  console.error("Error message:", error.message);
		}
		alert("Error uploading file");
	  }
	};
  </script>
  
  <style>
	.container {
	  max-width: 600px;
	  margin: 50px auto;
	  text-align: center;
	}
  
	ul {
	  list-style: none;
	  padding: 0;
	}
  
	li {
	  margin: 5px 0;
	}
  </style>
  
  <div class="container">
	<h1>File Checker</h1>
	<input type="file" on:change="{handleFileChange}" />
	<button on:click="{uploadFile}">Upload</button>
  
	{#if result}
	  <h2>Results</h2>
	  <div>
		<h3>Duplicates</h3>
		<ul>
		  {#each result.duplicates as duplicate}
			<li>{duplicate}</li>
		  {/each}
		</ul>
	  </div>
	  <div>
		<h3>New Entries</h3>
		<ul>
		  {#each result.newEntries as entry}
			<li>{entry}</li>
		  {/each}
		</ul>
	  </div>
	{/if}
  </div>