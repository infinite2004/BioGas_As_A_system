import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  LayoutDashboard, 
  Settings, 
  HelpCircle,
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  X,
  Mail,
  Trash2,
  Info,
  ChevronRight,
  TrendingDown,
  Building2,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Calendar
} from 'lucide-react';
import clsx from 'clsx';
import { Project, StageStatus, FeedstockType, STAGE_NAMES, getOverallStatus, getWhoMustActNext, getNextActionSuggestion, StageKey, StageOwner } from './lib/models';
import { loadProjects, saveProjects, isOnboardingDismissed, setOnboardingDismissed } from './lib/storage';
import './styles/App.css';

// --- Utilities ---
const getDaysStuck = (updatedAt: string) => {
  const diffTime = Math.abs(new Date().getTime() - new Date(updatedAt).getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// --- Components ---

const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => (
  <div className="sidebar">
    <div className="sidebar-logo">
      <Building2 size={32} color="#059669" />
      <span>BiotechSync</span>
    </div>
    <div className="sidebar-nav">
      <div 
        className={clsx('nav-item', activeTab === 'dashboard' && 'active')} 
        onClick={() => onTabChange('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </div>
      <div 
        className={clsx('nav-item', activeTab === 'analytics' && 'active')} 
        onClick={() => onTabChange('analytics')}
      >
        <TrendingDown size={20} />
        <span>Analytics</span>
      </div>
      <div 
        className={clsx('nav-item', activeTab === 'settings' && 'active')} 
        onClick={() => onTabChange('settings')}
      >
        <Settings size={20} />
        <span>Settings</span>
      </div>
    </div>
    <div style={{ marginTop: 'auto' }}>
      <div className="nav-item">
        <HelpCircle size={20} />
        <span>Help Center</span>
      </div>
    </div>
  </div>
);

const AnalyticsView = ({ projects }: { projects: Project[] }) => {
  const stats = useMemo(() => {
    const feedstockCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    projects.forEach(p => {
      feedstockCounts[p.feedstock] = (feedstockCounts[p.feedstock] || 0) + 1;
      statusCounts[p.overallStatus] = (statusCounts[p.overallStatus] || 0) + 1;
    });
    return { feedstockCounts, statusCounts };
  }, [projects]);

  return (
    <div className="analytics-view">
      <header>
        <div className="title-group">
          <h1>Analytics Overview</h1>
          <p>Portfolio-wide performance metrics and distribution.</p>
        </div>
      </header>
      
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Projects by Feedstock</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(stats.feedstockCounts).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem' }}>{type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, marginLeft: '1rem' }}>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', flex: 1, overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: 'var(--primary)', 
                      width: `${(count / projects.length) * 100}%` 
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', minWidth: '2rem' }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Overall Status Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem' }}>{status}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, marginLeft: '1rem' }}>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', flex: 1, overflow: 'hidden' }}>
                    <div className={`status-bar-${status.replace(' ', '-')}`} style={{ 
                      height: '100%', 
                      width: `${(count / projects.length) * 100}%` 
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', minWidth: '2rem' }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StageChip: React.FC<{ status: StageStatus; date: string }> = ({ status, date }) => {
  const days = getDaysStuck(date);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span className={clsx('chip', `chip-${status.replace(' ', '-')}`)}>
        {status === 'Blocked' && <AlertTriangle size={12} style={{ marginRight: '4px' }} />}
        {status === 'Approved' && <CheckCircle2 size={12} style={{ marginRight: '4px' }} />}
        {status}
      </span>
      {status === 'Blocked' && days > 0 && (
        <span style={{ fontSize: '0.7rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 'bold' }}>
          <Clock size={10} /> {days} stuck
        </span>
      )}
    </div>
  );
};

const StatCard: React.FC<{ 
  label: string, 
  value: number, 
  isActive: boolean, 
  onClick: () => void,
  colorScheme: string,
  subtext?: string
}> = ({ label, value, isActive, onClick, colorScheme, subtext }) => (
  <div 
    className={clsx('card stat-card card-hover', isActive && 'active')} 
    onClick={onClick}
    style={{ borderLeft: `4px solid ${colorScheme}` }}
  >
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
    {subtext && <span style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 'bold' }}>{subtext}</span>}
  </div>
);

const EmptyState = ({ onReset }: { onReset: () => void }) => (
  <div className="empty-state">
    <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
      <Search size={48} color="#94a3b8" />
    </div>
    <h3>No projects found</h3>
    <p>Try adjusting your search or filters to find what you're looking for.</p>
    <button className="btn btn-outline" onClick={onReset}>Clear all filters</button>
  </div>
);

const NoteInput = ({ onAdd }: { onAdd: (text: string) => void }) => {
  const [text, setText] = useState('');
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input 
        className="search-input" 
        style={{ paddingLeft: '0.75rem' }}
        placeholder="Add progress note..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { onAdd(text); setText(''); } }}
      />
      <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => { onAdd(text); setText(''); }}>Add</button>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedstockFilter, setFeedstockFilter] = useState<FeedstockType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<StageStatus | 'All'>('All');
  const [bottleneckFilter, setBottleneckFilter] = useState<StageKey | 'All'>('All');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Project | string, direction: 'asc' | 'desc' } | null>({ key: 'lastUpdated', direction: 'desc' });
  const [showFollowUpModal, setShowFollowUpModal] = useState<{ project: Project, stage: StageKey } | null>(null);

  useEffect(() => {
    setProjects(loadProjects());
    setShowOnboarding(!isOnboardingDismissed());
  }, []);

  const handleSave = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
  };

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId), 
    [projects, selectedProjectId]
  );

  const bottleneckStats = useMemo(() => {
    const stats = {
      permitting: { count: 0, totalDays: 0 },
      injection: { count: 0, totalDays: 0 },
      financing: { count: 0, totalDays: 0 },
    };
    projects.forEach(p => {
      (['permitting', 'injection', 'financing'] as StageKey[]).forEach(key => {
        if (p.stages[key].status === 'Blocked') {
          stats[key].count++;
          stats[key].totalDays += getDaysStuck(p.stages[key].updatedAt);
        }
      });
    });
    
    const maxCount = Math.max(stats.permitting.count, stats.injection.count, stats.financing.count);
    const topKey = maxCount > 0 ? (Object.keys(stats) as StageKey[]).find(k => stats[k].count === maxCount) : null;
    const avgStuck = topKey ? Math.round(stats[topKey].totalDays / stats[topKey].count) : 0;
    
    return { stats, topKey, avgStuck };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFeedstock = feedstockFilter === 'All' || p.feedstock === feedstockFilter;
      const matchStatus = statusFilter === 'All' || p.overallStatus === statusFilter;
      const matchBottleneck = bottleneckFilter === 'All' || p.stages[bottleneckFilter].status === 'Blocked';
      return matchSearch && matchFeedstock && matchStatus && matchBottleneck;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: any = (a as any)[sortConfig.key];
        let bVal: any = (b as any)[sortConfig.key];
        
        if (sortConfig.key === 'permitting') aVal = a.stages.permitting.status;
        if (sortConfig.key === 'injection') aVal = a.stages.injection.status;
        if (sortConfig.key === 'financing') aVal = a.stages.financing.status;

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [projects, searchTerm, feedstockFilter, statusFilter, bottleneckFilter, sortConfig]);

  const toggleSort = (key: string) => {
    setSortConfig(current => (current?.key === key && current.direction === 'asc') ? { key, direction: 'desc' } : { key, direction: 'asc' });
  };

  const handleUpdateStatus = (projectId: string, stageKey: StageKey, newStatus: StageStatus) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const newStages = {
          ...p.stages,
          [stageKey]: { ...p.stages[stageKey], status: newStatus, updatedAt: new Date().toISOString() }
        };
        return { ...p, stages: newStages, overallStatus: getOverallStatus(newStages), lastUpdated: new Date().toISOString() };
      }
      return p;
    });
    handleSave(updated);
  };

  const handleAddNote = (projectId: string, stageKey: StageKey, text: string) => {
    if (!text.trim()) return;
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const note = { id: Math.random().toString(36).substr(2, 9), text, timestamp: new Date().toISOString() };
        const newStages = {
          ...p.stages,
          [stageKey]: { ...p.stages[stageKey], notes: [note, ...p.stages[stageKey].notes], updatedAt: new Date().toISOString() }
        };
        return { ...p, stages: newStages, lastUpdated: new Date().toISOString() };
      }
      return p;
    });
    handleSave(updated);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Permanently delete this project? This action cannot be undone.')) {
      handleSave(projects.filter(p => p.id !== id));
      setSelectedProjectId(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFeedstockFilter('All');
    setStatusFilter('All');
    setBottleneckFilter('All');
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <>
            <header>
              <div className="title-group">
                <h1>Biomethane Portfolio</h1>
                <p>Track progress, identify risks, and accelerate operations.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={18} /> New Project
              </button>
            </header>

            {showOnboarding && (
              <div className="onboarding-banner">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Info size={20} />
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>First-time speed run:</span>
                  </div>
                  <div className="onboarding-steps">
                    <div className="step">
                      <div className="step-number">1</div>
                      <span>Click "Stalled" cards below to filter bottlenecks.</span>
                    </div>
                    <div className="step">
                      <div className="step-number">2</div>
                      <span>Select a project to see who must act next.</span>
                    </div>
                    <div className="step">
                      <div className="step-number">3</div>
                      <span>Send a follow-up email from the project drawer.</span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ color: 'white' }} onClick={() => { setShowOnboarding(false); setOnboardingDismissed(true); }}>
                  <X size={20} />
                </button>
              </div>
            )}

            <div className="stats-grid">
              <StatCard 
                label="Permitting Stalled" 
                value={bottleneckStats.stats.permitting.count} 
                isActive={bottleneckFilter === 'permitting'} 
                onClick={() => setBottleneckFilter(bottleneckFilter === 'permitting' ? 'All' : 'permitting')}
                colorScheme="#ef4444"
              />
              <StatCard 
                label="Injection Stalled" 
                value={bottleneckStats.stats.injection.count} 
                isActive={bottleneckFilter === 'injection'} 
                onClick={() => setBottleneckFilter(bottleneckFilter === 'injection' ? 'All' : 'injection')}
                colorScheme="#f59e0b"
              />
              <StatCard 
                label="Financing Stalled" 
                value={bottleneckStats.stats.financing.count} 
                isActive={bottleneckFilter === 'financing'} 
                onClick={() => setBottleneckFilter(bottleneckFilter === 'financing' ? 'All' : 'financing')}
                colorScheme="#6366f1"
              />
              <div className="card stat-card" style={{ background: '#f8fafc', borderLeft: '4px solid #94a3b8' }}>
                <span className="stat-label">Top Bottleneck</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{bottleneckStats.topKey ? STAGE_NAMES[bottleneckStats.topKey] : 'Pipeline Clear'}</span>
                {bottleneckStats.topKey && (
                  <span style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Avg. {bottleneckStats.avgStuck} days stuck
                  </span>
                )}
              </div>
            </div>

            <div className="filters-bar">
              <div className="input-wrapper">
                <Search className="input-icon" size={18} />
                <input 
                  className="search-input" 
                  placeholder="Search projects by name..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="select-input" value={feedstockFilter} onChange={e => setFeedstockFilter(e.target.value as any)}>
                <option value="All">All Feedstocks</option>
                <option value="Landfill Gas">Landfill Gas</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Livestock Waste">Livestock Waste</option>
              </select>
              <select className="select-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                <option value="All">Overall Status</option>
                <option value="In progress">In progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Approved">Approved</option>
              </select>
              {(searchTerm || feedstockFilter !== 'All' || statusFilter !== 'All' || bottleneckFilter !== 'All') && (
                <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Reset</button>
              )}
            </div>

            <div className="table-container">
              {filteredProjects.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort('name')}>Project <ArrowUpDown size={12} style={{ marginLeft: '4px' }} /></th>
                      <th onClick={() => toggleSort('feedstock')}>Feedstock</th>
                      <th onClick={() => toggleSort('permitting')}>Permitting</th>
                      <th onClick={() => toggleSort('injection')}>Injection</th>
                      <th onClick={() => toggleSort('financing')}>Financing</th>
                      <th onClick={() => toggleSort('overallStatus')}>Status</th>
                      <th onClick={() => toggleSort('lastUpdated')}>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map(p => (
                      <tr 
                        key={p.id} 
                        className="clickable-row" 
                        onClick={() => setSelectedProjectId(p.id)}
                        tabIndex={0}
                        role="button"
                      >
                        <td>
                          <div style={{ fontWeight: '700' }}>{p.name}</div>
                          <div className="project-type-badge">{p.location || 'Location Pending'}</div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.feedstock}</td>
                        <td><StageChip status={p.stages.permitting.status} date={p.stages.permitting.updatedAt} /></td>
                        <td><StageChip status={p.stages.injection.status} date={p.stages.injection.updatedAt} /></td>
                        <td><StageChip status={p.stages.financing.status} date={p.stages.financing.updatedAt} /></td>
                        <td>
                          <span className={clsx('chip', `chip-${p.overallStatus.replace(' ', '-')}`)}>
                            {p.overallStatus}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {new Date(p.lastUpdated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState onReset={resetFilters} />
              )}
            </div>
          </>
        )}

        {activeTab === 'analytics' && <AnalyticsView projects={projects} />}

        {activeTab === 'settings' && (
          <div className="settings-view">
            <header>
              <div className="title-group">
                <h1>Settings</h1>
                <p>Manage your account and preferences.</p>
              </div>
            </header>
            <div className="card" style={{ padding: '2rem', maxWidth: '600px' }}>
              <h3>General Preferences</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Customize your dashboard experience.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>Onboarding Guide</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Show the walkthrough banner on the dashboard.</div>
                  </div>
                  <button className="btn btn-outline" onClick={() => setOnboardingDismissed(false)}>Reset Guide</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>Local Storage Data</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clear all projects and reset to seed data.</div>
                  </div>
                  <button className="btn btn-outline" style={{ color: '#ef4444' }} onClick={() => {
                    if (confirm('Are you sure? This will delete all your custom projects.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}>Reset App</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedProject && (
        <div className="drawer-overlay" onClick={() => setSelectedProjectId(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="project-type-badge" style={{ marginBottom: '0.5rem' }}>{selectedProject.feedstock}</span>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{selectedProject.name}</h2>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelectedProjectId(null)} aria-label="Close">
                <X size={24} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="next-action-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                  <TrendingDown size={18} />
                  NEXT BEST ACTION
                </div>
                {(() => {
                  const stages: StageKey[] = ['permitting', 'injection', 'financing'];
                  const blockingStage = stages.find(s => selectedProject.stages[s].status === 'Blocked') || stages.find(s => selectedProject.stages[s].status === 'In progress');
                  if (!blockingStage) return 'Project completed!';
                  return `Requirement: ${getNextActionSuggestion(blockingStage, selectedProject.stages[blockingStage].status)}`;
                })()}
                <div className="owner-info" style={{ marginTop: '0.75rem', fontWeight: 'bold', color: '#854d0e' }}>
                  AWAITING ACTION FROM: {getWhoMustActNext(selectedProject)}
                </div>
              </div>

              {(['permitting', 'injection', 'financing'] as StageKey[]).map(key => (
                <div key={key} className="stage-section">
                  <div className="stage-section-header">
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{STAGE_NAMES[key]}</span>
                    <span className={clsx('chip', `chip-${selectedProject.stages[key].status.replace(' ', '-')}`)}>
                      {selectedProject.stages[key].status}
                    </span>
                  </div>
                  <div className="stage-section-content">
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
                      {(['Not started', 'In progress', 'Blocked', 'Approved'] as StageStatus[]).map(s => (
                        <button 
                          key={s} 
                          className={clsx('btn btn-outline', selectedProject.stages[key].status === s && 'btn-primary')}
                          style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem', whiteSpace: 'nowrap' }}
                          onClick={() => handleUpdateStatus(selectedProject.id, key, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    {(selectedProject.stages[key].status === 'Blocked' || selectedProject.stages[key].status === 'In progress') && (
                      <button className="btn btn-outline" style={{ display: 'flex', width: '100%', marginBottom: '1.25rem' }} onClick={() => setShowFollowUpModal({ project: selectedProject, stage: key })}>
                        <Mail size={14} /> Send Follow-up to {selectedProject.stages[key].owner}
                      </button>
                    )}

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <NoteInput onAdd={(t) => handleAddNote(selectedProject.id, key, t)} />
                      <div style={{ marginTop: '1rem' }}>
                        {selectedProject.stages[key].notes.map((n: any) => (
                          <div key={n.id} className="note-item">
                            <div>{n.text}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={10} /> {new Date(n.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-footer">
              <button 
                className="btn btn-outline" 
                style={{ width: '100%', color: '#ef4444', border: 'none' }}
                onClick={() => handleDeleteProject(selectedProject.id)}
              >
                <Trash2 size={16} /> Delete Project Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal card">
            <h2>Start New Project</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Kick off a new biomethane facility tracker.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newProject: Project = {
                id: Math.random().toString(36).substr(2, 9),
                name: formData.get('name') as string,
                feedstock: formData.get('feedstock') as FeedstockType,
                location: formData.get('location') as string,
                stages: {
                  permitting: { status: 'Not started', updatedAt: new Date().toISOString(), owner: 'ANP', notes: [] },
                  injection: { status: 'Not started', updatedAt: new Date().toISOString(), owner: 'Utility', notes: [] },
                  financing: { status: 'Not started', updatedAt: new Date().toISOString(), owner: 'Lender', notes: [] },
                },
                overallStatus: 'Not started',
                lastUpdated: new Date().toISOString(),
              };
              handleSave([...projects, newProject]);
              setShowAddModal(false);
            }}>
              <div className="form-group">
                <label>Legal Entity / Project Name</label>
                <input name="name" placeholder="e.g. BioEnergy Plant Alpha" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Feedstock Type</label>
                  <select name="feedstock" className="select-input" style={{ width: '100%' }}>
                    <option>Landfill Gas</option>
                    <option>Sugarcane</option>
                    <option>Livestock Waste</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Region / Location</label>
                  <input name="location" placeholder="e.g. Brazil SP" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFollowUpModal && (
        <div className="modal-overlay" onClick={() => setShowFollowUpModal(null)}>
          <div className="modal card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Email Template: {showFollowUpModal.project.stages[showFollowUpModal.stage].owner}</h3>
              <button className="btn btn-ghost" onClick={() => setShowFollowUpModal(null)}><X size={20}/></button>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>We've prepared a follow-up message to help clear this bottleneck.</p>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '1rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <strong>Subject:</strong> Follow-up: {STAGE_NAMES[showFollowUpModal.stage]} - {showFollowUpModal.project.name}
              </div>
              <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                {`Dear ${showFollowUpModal.project.stages[showFollowUpModal.stage].owner} Team,\n\nI am following up on the ${STAGE_NAMES[showFollowUpModal.stage]} review for the ${showFollowUpModal.project.name} project.\n\nOur records indicate the status is currently "${showFollowUpModal.project.stages[showFollowUpModal.stage].status}". We are ready to provide any additional documentation required to move to the next stage.\n\nBest regards,\nOperations Lead`}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={() => {
                navigator.clipboard.writeText(`Subject: Follow-up: ${STAGE_NAMES[showFollowUpModal.stage]} - ${showFollowUpModal.project.name}\n\nDear ${showFollowUpModal.project.stages[showFollowUpModal.stage].owner} Team,\n\nI am following up on the ${STAGE_NAMES[showFollowUpModal.stage]} review for the ${showFollowUpModal.project.name} project.\n\nOur records indicate the status is currently "${showFollowUpModal.project.stages[showFollowUpModal.stage].status}". We are ready to provide any additional documentation required to move to the next stage.\n\nBest regards,\nOperations Lead`);
                alert('Copied message to clipboard!');
              }}>Copy to Clipboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
