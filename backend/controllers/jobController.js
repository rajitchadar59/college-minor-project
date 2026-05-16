const axios = require('axios');

exports.searchJobs = async (req, res) => {
  try {
    const { query, location, isRemote, type } = req.body;
    
    
    let searchQuery = query; 
    
   
    if (type === 'internship') {
        searchQuery += ' internship';
    }

   
    if (location && location.trim() !== '') {
        searchQuery += ` in ${location.trim()}`;
    }

    
    if (isRemote) {
        searchQuery += ' remote';
    }

    console.log("JSearch Query sent to API:", searchQuery); 

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: { 
        query: searchQuery, 
        page: '1', 
        num_pages: '1' 
      },
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    res.status(200).json({ success: true, data: response.data.data });

  } catch (error) {
    console.error("JSearch API Error:", error?.response?.data || error.message);
    res.status(500).json({ success: false, message: "Error fetching jobs." });
  }
};