const CourseGeneration = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">🎓 Course Generation Settings</h1>
        <p className="text-muted-foreground">This is the detailed course generation settings page!</p>
        <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-green-800 dark:text-green-200">✅ The routing is working! This shows the course generation page is loading correctly.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">🎯 Course Topic</h3>
          <p className="text-sm text-muted-foreground">What course do you want to create?</p>
          <textarea 
            className="w-full mt-3 p-3 border rounded-lg" 
            placeholder="Example: Advanced React development with real-world projects..."
            rows={4}
          />
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📊 Skill Level</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <p className="font-medium">Beginner</p>
                  <p className="text-sm text-muted-foreground">New to the subject</p>
                </div>
              </div>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌿</span>
                <div>
                  <p className="font-medium">Intermediate</p>
                  <p className="text-sm text-muted-foreground">Familiar with basics</p>
                </div>
              </div>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌳</span>
                <div>
                  <p className="font-medium">Advanced</p>
                  <p className="text-sm text-muted-foreground">Experienced practitioner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">⏰ Time Commitment</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <span className="text-xl">☀️</span>
                <div>
                  <p className="font-medium">Light (1-2 hours/week)</p>
                  <p className="text-sm text-muted-foreground">Casual pace</p>
                </div>
              </div>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🌤️</span>
                <div>
                  <p className="font-medium">Moderate (3-5 hours/week)</p>
                  <p className="text-sm text-muted-foreground">Balanced learning</p>
                </div>
              </div>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="font-medium">Intensive (6+ hours/week)</p>
                  <p className="text-sm text-muted-foreground">Deep focus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-3">📚 Course Duration</h3>
          <div className="space-y-3">
            <button className="w-full p-3 border rounded-lg text-left hover:bg-gray-50">
              <div className="font-medium">10 Hours</div>
              <div className="text-sm text-muted-foreground">Quick Skill Boost</div>
            </button>
            <button className="w-full p-3 border rounded-lg text-left hover:bg-gray-50">
              <div className="font-medium">20 Hours</div>
              <div className="text-sm text-muted-foreground">Comprehensive Learning</div>
            </button>
            <button className="w-full p-3 border rounded-lg text-left hover:bg-gray-50">
              <div className="font-medium">40 Hours</div>
              <div className="text-sm text-muted-foreground">Deep Mastery</div>
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
          🚀 Generate Course
        </button>
      </div>
    </div>
  );
};

export default CourseGeneration;
