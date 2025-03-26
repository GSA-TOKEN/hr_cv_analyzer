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
            '18-under',
            '18-22',
            '23-28',
            '28-35',
            '36-45',
            '46+',
        ]
    },
    'language': {
        label: 'Languages',
        options: [
            'english-basic',
            'english-intermediate',
            'english-advanced',
            'english-fluent',
            'english-native',
            'russian-basic',
            'russian-intermediate',
            'russian-advanced',
            'russian-fluent',
            'russian-native',
            'german-basic',
            'german-intermediate',
            'german-advanced',
            'german-fluent',
            'german-native',
            'turkish-basic',
            'turkish-intermediate',
            'turkish-advanced',
            'turkish-fluent',
            'turkish-native',
            // Other languages can be added as needed
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
    'skill': {
        label: 'Technical Skills',
        groups: {
            'front-office-reservation-crm-call-center': {
                label: 'Front Office / Reservation / CRM',
                options: [
                    'pms-systems',
                    'booking-engines',
                    'payment-processing-systems',
                    'crm-software',
                    'call-center-technologies',
                    'upselling-techniques',
                    'channel-management',
                    'yield-management',
                    'guest-loyalty-programs',
                    'check-in-check-out-procedures',
                    'foreign-exchange-handling',
                    'complaint-management'
                ]
            },
            'housekeeping-laundry-flower-center': {
                label: 'Housekeeping / Laundry',
                options: [
                    'inventory-management',
                    'chemical-handling',
                    'quality-control',
                    'industrial-equipment-operation',
                    'room-inspection',
                    'sustainability-practices',
                    'linen-management',
                    'deep-cleaning-protocols',
                    'floral-arrangement',
                    'decorative-displays',
                    'amenity-setup',
                    'vip-room-preparation'
                ]
            },
            'f-b-kitchen-dishroom': {
                label: 'F&B / Kitchen',
                options: [
                    'food-safety-certification',
                    'culinary-techniques',
                    'menu-planning',
                    'cost-control',
                    'pos-systems',
                    'specialty-cuisine-knowledge',
                    'beverage-service',
                    'banquet-operations',
                    'buffet-management',
                    'à-la-carte-service',
                    'restaurant-reservation-systems',
                    'allergen-management',
                    'wine-knowledge',
                    'cocktail-preparation'
                ]
            },
            // Other technical skill categories can be added
        }
    },
    'soft-skill': {
        label: 'Soft Skills',
        options: [
            'guest-communication',
            'problem-resolution',
            'team-leadership',
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
            'lifeguard-certification',
            'fire-safety',
            'security-certification',
            'spa-wellness-certifications',
            'sommelier-beverage-certifications',
            'revenue-management',
            'environmental-management',
            'health-safety',
            'project-management',
            'it-certifications',
            'guest-service-gold',
            'financial-certifications',
            'hospitality-management-certification',
            'training-certification',
            'pool-operations',
            'fitness-instruction',
            'language-certifications',
            'eco-certification'
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
    const [open, setOpen] = useState(false);

    useEffect(() => {
        onFilterChange(selectedTags);
    }, [selectedTags, onFilterChange]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSelectedTags([]);
    };

    // Helper to render regular options
    const renderOptions = (category: string, options: string[]) => {
        return options.map(option => {
            const fullTag = `${category}:${option}`;
            const isSelected = selectedTags.includes(fullTag);

            return (
                <DropdownMenuItem
                    key={fullTag}
                    onSelect={(e) => {
                        e.preventDefault();
                        toggleTag(fullTag);
                    }}
                    className="flex items-center justify-between"
                >
                    <span className="capitalize">{option.replace(/-/g, ' ')}</span>
                    {isSelected && <Check className="h-4 w-4 text-green-600" />}
                </DropdownMenuItem>
            );
        });
    };

    // Helper to render nested skill options
    const renderSkillOptions = (category: string, groups: Record<string, { label: string, options: string[] }>) => {
        return Object.entries(groups).map(([groupKey, group]) => (
            <DropdownMenuSub key={groupKey}>
                <DropdownMenuSubTrigger>{group.label}</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        {group.options.map(option => {
                            const fullTag = `${category}:${groupKey}:${option}`;
                            const isSelected = selectedTags.includes(fullTag);

                            return (
                                <DropdownMenuItem
                                    key={fullTag}
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        toggleTag(fullTag);
                                    }}
                                    className="flex items-center justify-between"
                                >
                                    <span className="capitalize">{option.replace(/-/g, ' ')}</span>
                                    {isSelected && <Check className="h-4 w-4 text-green-600" />}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        ));
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter by tags
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72">
                        <DropdownMenuLabel className="flex justify-between items-center">
                            <span>Filter by tags</span>
                            {selectedTags.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-6 px-2 text-xs"
                                >
                                    Clear all
                                </Button>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {Object.entries(tagCategories).map(([category, categoryData]) => (
                            <React.Fragment key={category}>
                                {/* For regular categories with simple options */}
                                {!hasGroups(categoryData) && (
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>{categoryData.label}</DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                {renderOptions(category, categoryData.options)}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                )}

                                {/* For technical skills with nested groups */}
                                {hasGroups(categoryData) && (
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>{categoryData.label}</DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                {renderSkillOptions(category, categoryData.groups)}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                )}

                                <DropdownMenuSeparator />
                            </React.Fragment>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {selectedTags.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-9"
                    >
                        Clear filters
                    </Button>
                )}
            </div>

            {/* Display selected filters as badges */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map(tag => {
                        const [category, ...rest] = tag.split(':');
                        const displayValue = rest.join(':').replace(/-/g, ' ');
                        const categoryInfo = tagCategories[category];

                        return (
                            <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1">
                                <span className="mr-1">
                                    <strong>{categoryInfo?.label || category}:</strong> {displayValue}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleTag(tag)}
                                    className="h-5 w-5 p-0 ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TagFilterDropdown; 