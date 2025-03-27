import React, { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Filter, X, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define types for tag categories
interface TagOption {
    label: string;
    options: string[];
}

interface TagGroup {
    label: string;
    options: string[];
}

interface TagCategory {
    label: string;
    options?: string[];
    groups?: Record<string, TagGroup>;
}

// Define tag categories and their options
const tagCategories: Record<string, TagCategory> = {
    languages: {
        label: "Languages",
        groups: {
            english: {
                label: "English",
                options: [
                    "language:english-native",
                    "language:english-fluent",
                    "language:english-advanced",
                    "language:english-intermediate",
                    "language:english-basic"
                ]
            },
            spanish: {
                label: "Spanish",
                options: [
                    "language:spanish-native",
                    "language:spanish-fluent",
                    "language:spanish-advanced",
                    "language:spanish-intermediate",
                    "language:spanish-basic"
                ]
            },
            french: {
                label: "French",
                options: [
                    "language:french-native",
                    "language:french-fluent",
                    "language:french-advanced",
                    "language:french-intermediate",
                    "language:french-basic"
                ]
            },
            german: {
                label: "German",
                options: [
                    "language:german-native",
                    "language:german-fluent",
                    "language:german-advanced",
                    "language:german-intermediate",
                    "language:german-basic"
                ]
            },
            chinese: {
                label: "Chinese",
                options: [
                    "language:chinese-native",
                    "language:chinese-fluent",
                    "language:chinese-advanced",
                    "language:chinese-intermediate",
                    "language:chinese-basic"
                ]
            },
            japanese: {
                label: "Japanese",
                options: [
                    "language:japanese-native",
                    "language:japanese-fluent",
                    "language:japanese-advanced",
                    "language:japanese-intermediate",
                    "language:japanese-basic"
                ]
            },
            korean: {
                label: "Korean",
                options: [
                    "language:korean-native",
                    "language:korean-fluent",
                    "language:korean-advanced",
                    "language:korean-intermediate",
                    "language:korean-basic"
                ]
            },
            arabic: {
                label: "Arabic",
                options: [
                    "language:arabic-native",
                    "language:arabic-fluent",
                    "language:arabic-advanced",
                    "language:arabic-intermediate",
                    "language:arabic-basic"
                ]
            },
            russian: {
                label: "Russian",
                options: [
                    "language:russian-native",
                    "language:russian-fluent",
                    "language:russian-advanced",
                    "language:russian-intermediate",
                    "language:russian-basic"
                ]
            },
            portuguese: {
                label: "Portuguese",
                options: [
                    "language:portuguese-native",
                    "language:portuguese-fluent",
                    "language:portuguese-advanced",
                    "language:portuguese-intermediate",
                    "language:portuguese-basic"
                ]
            }
        }
    },
    education: {
        label: "Education",
        options: [
            "education:high-school",
            "education:associate-degree",
            "education:bachelors-degree",
            "education:masters-degree",
            "education:phd",
            "education:vocational-certificate",
            "education:professional-diploma",
            "education:industry-certification"
        ]
    },
    experience: {
        label: "Experience",
        options: [
            "experience:no-experience",
            "experience:less-than-1-year",
            "experience:1-3-years",
            "experience:3-5-years",
            "experience:5-10-years",
            "experience:10+-years"
        ]
    },
    position: {
        label: "Position",
        options: [
            "position:entry-level",
            "position:specialist",
            "position:supervisor",
            "position:manager",
            "position:department-head",
            "position:director",
            "position:executive"
        ]
    },
    field: {
        label: "Field",
        options: [
            "field:hospitality-management",
            "field:tourism",
            "field:culinary-arts",
            "field:business-administration",
            "field:finance-accounting",
            "field:engineering",
            "field:it-computer-science",
            "field:marketing-communications",
            "field:human-resources"
        ]
    },
    techskills: {
        label: "Technical Skills",
        options: [
            "technical-skill:front-office",
            "technical-skill:housekeeping",
            "technical-skill:fb-kitchen",
            "technical-skill:it-technical",
            "technical-skill:accounting-finance",
            "technical-skill:general"
        ]
    },
    softskills: {
        label: "Soft Skills",
        options: [
            "soft-skill:leadership",
            "soft-skill:communication",
            "soft-skill:problem-solving",
            "soft-skill:teamwork",
            "soft-skill:time-management",
            "soft-skill:adaptability",
            "soft-skill:creativity",
            "soft-skill:critical-thinking"
        ]
    },
    certifications: {
        label: "Certifications",
        options: [
            "certification:food-safety",
            "certification:first-aid-cpr",
            "certification:fire-safety",
            "certification:hospitality-management"
        ]
    },
    age: {
        label: "Age Range",
        options: [
            "age:under-18",
            "age:18-22",
            "age:23-28",
            "age:29-35",
            "age:36-45",
            "age:46+"
        ]
    }
};

interface TagFilterDropdownProps {
    onFilterChange: (tags: string[]) => void;
    initialSelectedTags?: string[];
}

const TagFilterDropdown: React.FC<TagFilterDropdownProps> = ({
    onFilterChange,
    initialSelectedTags = []
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        languages: true,
        education: false,
        experience: false,
        position: false,
        field: false,
        techskills: false,
        softskills: false,
        certifications: false,
        age: false
    });
    const [openLanguages, setOpenLanguages] = useState<Record<string, boolean>>({});

    // Apply initial tags
    useEffect(() => {
        if (JSON.stringify(initialSelectedTags) !== JSON.stringify(selectedTags)) {
            setSelectedTags(initialSelectedTags);
        }
    }, [initialSelectedTags]);

    // Update selected tags and notify parent
    const updateSelectedTags = (newTags: string[]) => {
        setSelectedTags(newTags);
        onFilterChange(newTags);
    };

    // Clear all filters
    const clearFilters = () => {
        const emptyTags: string[] = [];
        setSelectedTags(emptyTags);
        onFilterChange(emptyTags);
    };

    // Toggle section
    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Toggle language section
    const toggleLanguage = (language: string) => {
        setOpenLanguages(prev => ({
            ...prev,
            [language]: !prev[language]
        }));
    };

    // Get all options for a category
    const getCategoryOptions = (category: TagCategory) => {
        if (category.groups) {
            return Object.values(category.groups).flatMap((group: TagGroup) => group.options);
        }
        return category.options || [];
    };

    // Format the tag display by removing the prefix
    const formatTagDisplay = (tag: string): string => {
        // For language tags (language:english-native), extract and format both language and level
        if (tag.startsWith('language:')) {
            const parts = tag.split(':')[1].split('-');
            if (parts.length === 2) {
                const language = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                const level = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
                return `${level}`;
            }
        }

        // For other tags, remove the prefix and format
        const parts = tag.split(':');
        if (parts.length > 1) {
            return parts[parts.length - 1]
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        // Fallback
        return tag;
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Filter by Attributes</span>
                        {selectedTags.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {selectedTags.length}
                            </Badge>
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[280px]"
                align="end"
                sideOffset={5}
            >
                <div className="flex flex-col h-[600px]">
                    <div className="flex items-center justify-between p-2 border-b">
                        <DropdownMenuLabel className="text-base font-semibold">
                            Candidate Attributes
                        </DropdownMenuLabel>
                        {selectedTags.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={(e) => {
                                    e.preventDefault();
                                    clearFilters();
                                }}
                            >
                                <X className="mr-1 h-3 w-3" /> Clear all
                            </Button>
                        )}
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-2">
                            {Object.entries(tagCategories).map(([key, category]) => (
                                <Collapsible key={key} open={openSections[key]} onOpenChange={() => toggleSection(key)}>
                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{category.label}</span>
                                            {selectedTags.some(tag => getCategoryOptions(category).includes(tag)) && (
                                                <Badge variant="secondary" className="ml-2">
                                                    {selectedTags.filter(tag => getCategoryOptions(category).includes(tag)).length}
                                                </Badge>
                                            )}
                                        </div>
                                        <ChevronRight className={`h-4 w-4 transition-transform ${openSections[key] ? 'rotate-90' : ''}`} />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pt-2">
                                        {category.groups ? (
                                            <div className="space-y-2">
                                                {Object.entries(category.groups).map(([langKey, langGroup]: [string, any]) => (
                                                    <Collapsible key={langKey} open={openLanguages[langKey]} onOpenChange={() => toggleLanguage(langKey)}>
                                                        <CollapsibleTrigger className="flex items-center justify-between w-full p-1.5 hover:bg-accent rounded-md">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{langGroup.label}</span>
                                                                {selectedTags.some(tag => langGroup.options.includes(tag)) && (
                                                                    <Badge variant="secondary" className="ml-2">
                                                                        {selectedTags.filter(tag => langGroup.options.includes(tag)).length}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <ChevronRight className={`h-4 w-4 transition-transform ${openLanguages[langKey] ? 'rotate-90' : ''}`} />
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent className="pl-4 pt-1">
                                                            <div className="grid grid-cols-1 gap-1">
                                                                {langGroup.options.map((option: string) => (
                                                                    <div
                                                                        key={option}
                                                                        className="flex items-center space-x-1 cursor-pointer hover:bg-accent rounded-sm p-1"
                                                                        onClick={() => {
                                                                            const newTags = selectedTags.includes(option)
                                                                                ? selectedTags.filter(tag => tag !== option)
                                                                                : [...selectedTags, option];
                                                                            updateSelectedTags(newTags);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={`h-3 w-3 ${selectedTags.includes(option)
                                                                                ? 'text-primary'
                                                                                : 'text-muted-foreground'
                                                                                }`}
                                                                        />
                                                                        <span className="text-xs truncate">
                                                                            {formatTagDisplay(option)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-1">
                                                {category.options?.map((option: string) => (
                                                    <div
                                                        key={option}
                                                        className="flex items-center space-x-1 cursor-pointer hover:bg-accent rounded-sm p-1"
                                                        onClick={() => {
                                                            const newTags = selectedTags.includes(option)
                                                                ? selectedTags.filter(tag => tag !== option)
                                                                : [...selectedTags, option];
                                                            updateSelectedTags(newTags);
                                                        }}
                                                    >
                                                        <Check
                                                            className={`h-3 w-3 ${selectedTags.includes(option)
                                                                ? 'text-primary'
                                                                : 'text-muted-foreground'
                                                                }`}
                                                        />
                                                        <span className="text-xs truncate">{formatTagDisplay(option)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default TagFilterDropdown; 