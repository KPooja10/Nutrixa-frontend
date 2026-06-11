import React, { useState, useEffect } from 'react';
import { usePatients } from '../context/PatientContext';
import { api } from '../services/api';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import LoadingOverlay from '../components/LoadingOverlay';

export default function MealPlanner() {
  const { currentPatient, refreshCurrentPatient } = usePatients();
  
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Custom new meal additions
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMealType, setNewMealType] = useState('breakfast');
  const [newMealName, setNewMealName] = useState('');
  const [newNutritionScore, setNewNutritionScore] = useState(85);

  useEffect(() => {
    if (currentPatient) {
      loadMeals();
    }
  }, [currentPatient]);

  const loadMeals = async () => {
    setLoading(true);
    try {
      const data = await api.meals.getByPatient(currentPatient.id);
      setMeals(data);
    } catch (err) {
      console.error('Error fetching patient meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMeal = async (mealId, currentStatus) => {
    if (!currentPatient) return;
    setLoading(true);
    try {
      await api.meals.toggle(mealId, !currentStatus);
      await loadMeals();
      await refreshCurrentPatient();
    } catch (err) {
      console.error('Error toggling meal completion:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMealSubmit = async (e) => {
    e.preventDefault();
    if (!currentPatient || !newMealName) return;

    setLoading(true);
    try {
      await api.meals.log({
        patientId: currentPatient.id,
        mealType: newMealType,
        mealName: newMealName,
        completed: false,
        nutritionScore: parseInt(newNutritionScore)
      });
      setNewMealName('');
      setShowAddForm(false);
      await loadMeals();
      await refreshCurrentPatient();
    } catch (err) {
      console.error('Error planning new meal:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentPatient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="text-4xl mb-4">🧬</span>
        <p className="text-sm font-semibold">Please select a monitored patient to access the meal planners.</p>
      </div>
    );
  }

  // Group meals by clinical period types
  const periodTypes = [
    { type: 'early_morning', label: '🌅 Early Morning Nutrition', time: '06:00 - 07:00' },
    { type: 'breakfast', label: '🍳 Breakfast Planner', time: '08:30 - 09:30' },
    { type: 'snacks', label: '🍇 Snacks Planner', time: '11:00 - 11:30' },
    { type: 'lunch', label: '🍱 Lunch Planner', time: '13:00 - 14:00' },
    { type: 'evening_drink', label: '🥤 Evening Drink Planner', time: '16:30 - 17:00' },
    { type: 'dinner', label: '🍲 Dinner Planner', time: '19:30 - 20:30' }
  ];

  const completedCount = meals.filter(m => m.completed === 1).length;
  const adherenceRate = meals.length > 0 ? Math.round((completedCount / meals.length) * 100) : 100;

  return (
    <div className="space-y-6 relative">
      {loading && <LoadingOverlay message="Updating oncology compliance trackers..." />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Oncology Nutrition & Meal Planner</h1>
          <p className="text-slate-400 text-sm">
            Configure six daily therapeutic meal profiles and track interactive completions for: {currentPatient.patientName}
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl hover:shadow-neon-cyan transition"
        >
          {showAddForm ? 'Cancel Planning Form' : '➕ Plan Additional Meal Item'}
        </button>
      </div>

      {/* Dynamic Meal Creation Form */}
      {showAddForm && (
        <GlassCard glow className="shadow-neon-cyan border-cyan-500/20 max-w-xl">
          <form onSubmit={handleAddMealSubmit} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">New Nutrition Period Intake entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nutrition Window</label>
                <select
                  value={newMealType}
                  onChange={(e) => setNewMealType(e.target.value)}
                  className="w-full mt-1.5 bg-slate-900/60 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="early_morning">Early Morning Nutrition</option>
                  <option value="breakfast">Breakfast Planner</option>
                  <option value="snacks">Snacks Planner</option>
                  <option value="lunch">Lunch Planner</option>
                  <option value="evening_drink">Evening Drink Planner</option>
                  <option value="dinner">Dinner Planner</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Target Nutrient Rating (0-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newNutritionScore}
                  onChange={(e) => setNewNutritionScore(e.target.value)}
                  className="w-full mt-1.5 bg-slate-900/60 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Therapeutic Food Description</label>
                <input
                  type="text"
                  required
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="w-full mt-1.5 bg-slate-900/60 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500"
                  placeholder="e.g. Ginger Infusion Tea & 8 Activated Almonds"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition"
            >
              Add to Active Schedule
            </button>
          </form>
        </GlassCard>
      )}

      {/* Completion Adherence Tracker Summary Card */}
      <GlassCard className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Meal Completion Tracker</h3>
          <div className="text-3xl font-extrabold text-white mt-1">
            {completedCount} <span className="text-sm text-slate-400 font-normal">of {meals.length} Completed</span>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Clinical Compliance Level</span>
            <span className="text-cyan-400 font-bold">{adherenceRate}% Adherence</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${adherenceRate}%` }}
            />
          </div>
        </div>
      </GlassCard>

      {/* 6-Slot Meal Period List */}
      <div className="space-y-4">
        {periodTypes.map(period => {
          // Find matching meals planned for this type
          const periodMeals = meals.filter(m => m.mealType === period.type);

          return (
            <GlassCard key={period.type} className="border border-slate-800/80">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">{period.label}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wider font-mono uppercase mt-0.5">
                    ⏱️ Daily Staging Frame: {period.time}
                  </p>
                </div>

                <div className="w-full sm:w-auto space-y-3 flex-1 sm:flex-none">
                  {periodMeals.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-2">No specialized items planned.</div>
                  ) : (
                    periodMeals.map(meal => (
                      <div
                        key={meal.id}
                        className={`
                          p-3 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300
                          ${meal.completed === 1 
                            ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' 
                            : 'bg-slate-900/60 border-slate-700/80'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={meal.completed === 1}
                            onChange={() => handleToggleMeal(meal.id, meal.completed === 1)}
                            className="w-4.5 h-4.5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 cursor-pointer"
                          />
                          <div>
                            <div className={`text-xs font-bold ${meal.completed === 1 ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                              {meal.mealName}
                            </div>
                            <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wide">
                              Nutrient Weight: <span className="text-cyan-400 font-mono font-bold">{meal.nutritionScore}</span>
                            </div>
                          </div>
                        </div>

                        <StatusBadge status={meal.completed === 1 ? 'Completed' : 'Missed'} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
