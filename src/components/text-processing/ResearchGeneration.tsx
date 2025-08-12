const ResearchGeneration = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">🔬 Research Paper Settings</h1>
        <p className="text-muted-foreground">This is the detailed research paper generation settings page!</p>
        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-green-800 dark:text-green-200">✅ The routing is working! This shows the research paper generation page is loading correctly.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">🔍 Research Topic</h3>
          <p className="text-sm text-muted-foreground">Define your research question or hypothesis</p>
          <textarea 
            className="w-full mt-3 p-3 border rounded-lg" 
            placeholder="Example: Impact of artificial intelligence on healthcare outcomes..."
            rows={4}
          />
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📚 Research Field</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="p-2 border rounded-lg text-sm hover:bg-gray-50">Computer Science</button>
            <button className="p-2 border rounded-lg text-sm hover:bg-gray-50">Medicine</button>
            <button className="p-2 border rounded-lg text-sm hover:bg-gray-50">Psychology</button>
            <button className="p-2 border rounded-lg text-sm hover:bg-gray-50">Business</button>
            <button className="p-2 border rounded-lg text-sm hover:bg-gray-50">Engineering</button>
            <button className="p-2 border rounded-lg text-sm hover:bg-gray-50">Environmental Science</button>
            <button className="p-2 border rounded-lg text-sm hover:bg-gray-50">Economics</button>
            <button className="p-2 border rounded-lg text-sm hover:bg-gray-50">Education</button>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📝 Research Type</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <p className="font-medium text-sm">Empirical Research</p>
              <p className="text-xs text-muted-foreground">Data-driven analysis and experiments</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <p className="font-medium text-sm">Theoretical Paper</p>
              <p className="text-xs text-muted-foreground">Conceptual framework and theory development</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <p className="font-medium text-sm">Literature Review</p>
              <p className="text-xs text-muted-foreground">Comprehensive review of existing research</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <p className="font-medium text-sm">Case Study</p>
              <p className="text-xs text-muted-foreground">In-depth analysis of specific cases</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📊 Methodology</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="p-3 border rounded-lg text-sm hover:bg-gray-50">Quantitative</button>
            <button className="p-3 border rounded-lg text-sm hover:bg-gray-50">Qualitative</button>
            <button className="p-3 border rounded-lg text-sm hover:bg-gray-50">Mixed Methods</button>
            <button className="p-3 border rounded-lg text-sm hover:bg-gray-50">Experimental</button>
            <button className="p-3 border rounded-lg text-sm hover:bg-gray-50">Survey</button>
            <button className="p-3 border rounded-lg text-sm hover:bg-gray-50">Interview</button>
            <button className="p-3 border rounded-lg text-sm hover:bg-gray-50">Observational</button>
            <button className="p-3 border rounded-lg text-sm hover:bg-gray-50">Comparative</button>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📏 Paper Length</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium text-sm">Short Paper</p>
              <p className="text-sm text-blue-600">8-12 pages</p>
              <p className="text-xs text-muted-foreground">Conference paper format</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium text-sm">Standard Paper</p>
              <p className="text-sm text-blue-600">15-25 pages</p>
              <p className="text-xs text-muted-foreground">Journal article format</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium text-sm">Extended Paper</p>
              <p className="text-sm text-blue-600">30-50 pages</p>
              <p className="text-xs text-muted-foreground">Comprehensive research</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium text-sm">Thesis/Dissertation</p>
              <p className="text-sm text-blue-600">60+ pages</p>
              <p className="text-xs text-muted-foreground">Academic thesis format</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📋 Citation Style</h3>
          <div className="space-y-3">
            <select className="w-full p-3 border rounded-lg">
              <option>APA</option>
              <option>MLA</option>
              <option>Chicago</option>
              <option>Harvard</option>
              <option>IEEE</option>
            </select>
            <select className="w-full p-3 border rounded-lg">
              <option>Undergraduate Level</option>
              <option>Graduate Level</option>
              <option>PhD Level</option>
              <option>Professional Level</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          🔬 Generate Research Paper
        </button>
      </div>
    </div>
  );
};

export default ResearchGeneration;
