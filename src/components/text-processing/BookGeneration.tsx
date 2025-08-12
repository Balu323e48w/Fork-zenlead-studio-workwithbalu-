const BookGeneration = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">📚 Book Generation Settings</h1>
        <p className="text-muted-foreground">This is the detailed book generation settings page!</p>
        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-green-800 dark:text-green-200">✅ The routing is working! This shows the book generation page is loading correctly.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📝 Book Concept</h3>
          <p className="text-sm text-muted-foreground">What type of book do you want to create?</p>
          <textarea 
            className="w-full mt-3 p-3 border rounded-lg" 
            placeholder="Enter your book idea here..."
            rows={4}
          />
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">🎯 Target Audience</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="radio" name="audience" value="general" />
              <span>General Audience</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="audience" value="professional" />
              <span>Professionals</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="audience" value="students" />
              <span>Students</span>
            </label>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📏 Book Length</h3>
          <select className="w-full p-3 border rounded-lg">
            <option>Short Book (50-100 pages)</option>
            <option>Standard Book (150-250 pages)</option>
            <option>Extended Book (300-400 pages)</option>
            <option>Epic Book (500+ pages)</option>
          </select>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">✨ Features</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span>Table of Contents</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span>Chapter Structure</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" />
              <span>Include Images</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked />
              <span>Bibliography</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          🚀 Generate Book
        </button>
      </div>
    </div>
  );
};

export default BookGeneration;
