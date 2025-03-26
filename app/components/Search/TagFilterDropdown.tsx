import React, { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define types for tag categories
interface CategoryOption {
    label: string;
    options: string[];
}

interface CategoryWithGroups {
    label: string;
    groups: Record<string, { label: string, options: string[] }>;
}

type TagCategory = CategoryOption | CategoryWithGroups;

// Helper to check if a category has groups
const hasGroups = (category: TagCategory): category is CategoryWithGroups => {
    return 'groups' in category;
};

// Define tag categories matching the CV parser categories
const tagCategories: Record<string, TagCategory> = {
    'age': {
        label: 'Age',
        options: [
            'under-18',
            '18-22',
            '23-28',
            '28-35',
            '36-45',
            '46+'
        ]
    },
    'language': {
        label: 'Languages',
        options: [
            'english-native',
            'english-fluent',
            'english-advanced',
            'english-intermediate',
            'english-basic',
            'french-native',
            'french-fluent',
            'french-advanced',
            'french-intermediate',
            'french-basic',
            'german-native',
            'german-fluent',
            'german-advanced',
            'german-intermediate',
            'german-basic',
            'spanish-native',
            'spanish-fluent',
            'spanish-advanced',
            'spanish-intermediate',
            'spanish-basic',
            'turkish-native',
            'turkish-fluent',
            'turkish-advanced',
            'turkish-intermediate',
            'turkish-basic',
            'russian-native',
            'russian-fluent',
            'russian-advanced',
            'russian-intermediate',
            'russian-basic'
        ]
    },
    'education': {
        label: 'Education',
        options: [
            'high-school',
            'associate-degree',
            'bachelors-degree',
            'masters-degree',
            'phd',
            'vocational-certificate',
            'professional-diploma',
            'industry-certification'
        ]
    },
    'field': {
        label: 'Field of Study',
        options: [
            'hospitality-management',
            'tourism',
            'culinary-arts',
            'business-administration',
            'finance-accounting',
            'engineering',
            'it-computer-science',
            'recreation-management',
            'marketing-communications',
            'human-resources',
            'health-safety',
            'sports-leisure',
            'environmental-management',
            'spa-wellness',
            'landscape-architecture'
        ]
    },
    'experience': {
        label: 'Experience',
        options: [
            'no-experience',
            'less-than-1-year',
            '1-3-years',
            '3-5-years',
            '5-10-years',
            '10+-years'
        ]
    },
    'establishment': {
        label: 'Establishment Type',
        options: [
            'luxury-resort',
            'business-hotel',
            'restaurant-bar',
            'tour-operator',
            'cruise-line',
            'event-company',
            'corporate-office',
            'chain-hotel',
            'boutique-property',
            'casino',
            'golf-resort',
            'thermal-wellness-resort',
            'all-inclusive-resort',
            'timeshare-property'
        ]
    },
    'position': {
        label: 'Position Level',
        options: [
            'entry-level',
            'specialist',
            'supervisor',
            'manager',
            'department-head',
            'director',
            'executive'
        ]
    },
    'technical-skill': {
        label: 'Technical Skills',
        groups: {
            'front-office': {
                label: 'Front Office / Reservation',
                options: [
                    'pms-systems',
                    'booking-engines',
                    'payment-processing',
                    'crm-software',
                    'channel-management',
                    'yield-management',
                    'guest-loyalty-programs',
                    'check-in-out-procedures',
                    'foreign-exchange',
                    'complaint-management'
                ]
            },
            'housekeeping': {
                label: 'Housekeeping / Laundry',
                options: [
                    'inventory-management',
                    'quality-control',
                    'room-inspection',
                    'sustainability-practices',
                    'linen-management',
                    'deep-cleaning-protocols',
                    'amenity-setup',
                    'vip-room-preparation'
                ]
            },
            'fb-kitchen': {
                label: 'F&B / Kitchen',
                options: [
                    'food-safety',
                    'culinary-techniques',
                    'menu-planning',
                    'cost-control',
                    'pos-systems',
                    'specialty-cuisine',
                    'beverage-service',
                    'banquet-operations',
                    'buffet-management',
                    'restaurant-reservation',
                    'allergen-management',
                    'wine-knowledge',
                    'cocktail-preparation'
                ]
            },
            'it-technical': {
                label: 'IT / Technical',
                options: [
                    'project-management',
                    'software-development',
                    'database-management',
                    'network-administration',
                    'system-analysis',
                    'ui-ux-design',
                    'mobile-development',
                    'web-development',
                    'cloud-services',
                    'cybersecurity',
                    'data-analysis',
                    'it-support'
                ]
            },
            'accounting-finance': {
                label: 'Accounting / Finance',
                options: [
                    'financial-analysis',
                    'budgeting',
                    'forecasting',
                    'auditing',
                    'payroll-management',
                    'accounts-receivable',
                    'accounts-payable',
                    'tax-preparation',
                    'financial-reporting',
                    'bookkeeping'
                ]
            }
        }
    },
    'soft-skill': {
        label: 'Soft Skills',
        options: [
            'communication',
            'problem-solving',
            'leadership',
            'conflict-management',
            'time-management',
            'attention-to-detail',
            'cultural-sensitivity',
            'adaptability',
            'work-under-pressure',
            'emotional-intelligence',
            'decision-making',
            'initiative',
            'creativity',
            'strategic-thinking',
            'negotiation',
            'active-listening',
            'crisis-management',
            'delegation',
            'coaching-mentoring',
            'multitasking'
        ]
    },
    'certification': {
        label: 'Certifications',
        options: [
            'food-safety',
            'first-aid-cpr',
            'lifeguard',
            'fire-safety',
            'security',
            'spa-wellness',
            'sommelier',
            'revenue-management',
            'environmental-management',
            'health-safety',
            'project-management',
            'it-certification',
            'guest-service',
            'hospitality-management'
        ]
    }
};

interface TagFilterDropdownProps {
    onFilterChange: (selectedTags: string[]) => void;
    initialSelectedTags?: string[];
}

const TagFilterDropdown: React.FC<TagFilterDropdownProps> = ({
    onFilterChange,
    initialSelectedTags = []
}) => {
    const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

    useEffect(() => {
        onFilterChange(selectedTags);
    }, [selectedTags]);

    // Toggle tag selection
    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedTags([]);
    };

    // Render category options
    const renderOptions = (category: string, options: string[]) => {
        return (
            <div className="grid grid-cols-1 gap-1">
                {options.map((option) => {
                    const tag = `${category}:${option}`;
                    const isSelected = selectedTags.includes(tag);

                    return (
                        <DropdownMenuItem
                            key={option}
                            onSelect={(e) => {
                                e.preventDefault();
                                toggleTag(tag);
                            }}
                            className={`flex items-center justify-between px-2 py-1.5 cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
                        >
                            <span className="mr-2">{option.split('-').join(' ')}</span>
                            {isSelected && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                    );
                })}
            </div>
        );
    };

    // Render skill options with nested submenus
    const renderSkillOptions = (category: string, groups: Record<string, { label: string, options: string[] }>) => {
        return (
            <div className="space-y-1">
                {Object.entries(groups).map(([groupKey, group]) => (
                    <DropdownMenuSub key={groupKey}>
                        <DropdownMenuSubTrigger className="px-2 py-1.5">
                            <span>{group.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent className="min-w-[220px] max-h-[500px] overflow-y-auto">
                                <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {renderOptions(`${category}:${groupKey}`, group.options)}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                ))}
            </div>
        );
    };

    // Add proper display of tag prefixes and cleaner formatting
    const getTagDisplay = (category: string, value: string): { category: string, value: string } => {
        // Find the proper category label
        const categoryKey = Object.keys(tagCategories).find(key => key === category);
        const categoryLabel = categoryKey ? tagCategories[categoryKey].label : category;

        // Format display value
        let displayValue = value.split('-').join(' ');

        // Special formatting for nested technical skills
        if (category === 'technical-skill') {
            const [group, skill] = value.split(':');
            if (skill) {
                // Get group label if available
                let groupLabel = group;
                if (categoryKey && hasGroups(tagCategories[categoryKey])) {
                    const groups = (tagCategories[categoryKey] as CategoryWithGroups).groups;
                    if (groups[group]) {
                        groupLabel = groups[group].label;
                    }
                }
                displayValue = `${groupLabel}: ${skill.split('-').join(' ')}`;
            }
        }

        return {
            category: categoryLabel,
            value: displayValue
        };
    };

    return (
        <div className="w-full sm:w-auto">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={selectedTags.length > 0 ? "default" : "outline"}
                        className="w-full sm:w-auto justify-between"
                    >
                        <div className="flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            <span>
                                {selectedTags.length > 0
                                    ? `${selectedTags.length} Filter${selectedTags.length > 1 ? 's' : ''} Active`
                                    : 'Filter Candidates'}
                            </span>
                        </div>
                        <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[280px] max-h-[500px] overflow-y-auto" align="end">
                    <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Filter by Candidate Attributes</span>
                        {selectedTags.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 font-normal text-xs text-muted-foreground hover:text-foreground"
                                onClick={clearFilters}
                            >
                                Clear All
                            </Button>
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {Object.entries(tagCategories).map(([key, category]) => (
                        <DropdownMenuGroup key={key}>
                            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">{category.label}</DropdownMenuLabel>
                            {hasGroups(category)
                                ? renderSkillOptions(key, category.groups)
                                : renderOptions(key, category.options)
                            }
                            {key !== Object.keys(tagCategories)[Object.keys(tagCategories).length - 1] && (
                                <DropdownMenuSeparator />
                            )}
                        </DropdownMenuGroup>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default TagFilterDropdown; 