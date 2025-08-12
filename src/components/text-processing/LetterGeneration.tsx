const LetterGeneration = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">✉️ Professional Letter Settings</h1>
        <p className="text-muted-foreground">This is the detailed professional letter generation settings page!</p>
        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-green-800 dark:text-green-200">✅ The routing is working! This shows the letter generation page is loading correctly.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📝 Letter Purpose</h3>
          <p className="text-sm text-muted-foreground">What's the purpose of your letter?</p>
          <textarea 
            className="w-full mt-3 p-3 border rounded-lg" 
            placeholder="Example: I want to write a cover letter for a software engineer position..."
            rows={4}
          />
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">🏢 Letter Type</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-medium text-sm">Business Letter</div>
              <div className="text-xs text-muted-foreground">Professional correspondence</div>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium text-sm">Personal Letter</div>
              <div className="text-xs text-muted-foreground">Informal communication</div>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium text-sm">Formal Letter</div>
              <div className="text-xs text-muted-foreground">Official correspondence</div>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <div className="text-2xl mb-2">💼</div>
              <div className="font-medium text-sm">Cover Letter</div>
              <div className="text-xs text-muted-foreground">Job application</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">👤 Sender Information</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Your Name" className="w-full p-3 border rounded-lg" />
            <input type="text" placeholder="Job Title" className="w-full p-3 border rounded-lg" />
            <input type="text" placeholder="Company/Organization" className="w-full p-3 border rounded-lg" />
            <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg" />
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">🎯 Recipient Information</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Recipient Name" className="w-full p-3 border rounded-lg" />
            <input type="text" placeholder="Title/Position" className="w-full p-3 border rounded-lg" />
            <input type="text" placeholder="Company/Organization" className="w-full p-3 border rounded-lg" />
            <input type="text" placeholder="Subject Line" className="w-full p-3 border rounded-lg" />
          </div>
        </div>
        
        <div className="p-6 border rounded-lg col-span-full">
          <h3 className="font-semibold mb-3">🎨 Tone & Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium">Professional</p>
              <p className="text-xs text-muted-foreground">Formal business tone</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium">Friendly</p>
              <p className="text-xs text-muted-foreground">Warm and approachable</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium">Formal</p>
              <p className="text-xs text-muted-foreground">Official and respectful</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium">Persuasive</p>
              <p className="text-xs text-muted-foreground">Convincing and compelling</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium">Apologetic</p>
              <p className="text-xs text-muted-foreground">Remorseful and understanding</p>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-center">
              <p className="font-medium">Enthusiastic</p>
              <p className="text-xs text-muted-foreground">Energetic and positive</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
          ✉️ Generate Letter
        </button>
      </div>
    </div>
  );
};

export default LetterGeneration;
