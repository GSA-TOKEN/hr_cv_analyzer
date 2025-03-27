import React, { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter, X, ChevronRight, User, Briefcase, Sliders } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define types for demographic filters
interface DemographicFilters {
    age?: [number, number];
    department?: string;
    expectedSalary?: [number, number];
    firstName?: string;
    lastName?: string;
}

interface DemographicFilterDropdownProps {
    onFilterChange: (filters: DemographicFilters) => void;
    initialFilters?: DemographicFilters;
}

const DEFAULT_AGE_RANGE: [number, number] = [18, 65];
const DEFAULT_SALARY_RANGE: [number, number] = [0, 200000];

const DemographicFilterDropdown: React.FC<DemographicFilterDropdownProps> = ({
    onFilterChange,
    initialFilters = {}
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<DemographicFilters>(initialFilters);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        personal: true,
        professional: false,
        ranges: false
    });

    // Apply initial filters
    useEffect(() => {
        if (JSON.stringify(initialFilters) !== JSON.stringify(filters)) {
            setFilters(initialFilters);
        }
    }, []);

    // Count active filters
    const activeFilterCount = Object.keys(filters).filter(key => {
        const value = filters[key as keyof DemographicFilters];
        if (Array.isArray(value)) {
            if (key === 'age') {
                return value[0] !== DEFAULT_AGE_RANGE[0] || value[1] !== DEFAULT_AGE_RANGE[1];
            }
            if (key === 'expectedSalary') {
                return value[0] !== DEFAULT_SALARY_RANGE[0] || value[1] !== DEFAULT_SALARY_RANGE[1];
            }
            return true;
        }
        return value && value.length > 0;
    }).length;

    // Update filters and notify parent
    const updateFilters = (newFilters: DemographicFilters) => {
        const cleanedFilters = Object.entries(newFilters).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    if (key === 'age' && value.length === 2 && (value[0] !== DEFAULT_AGE_RANGE[0] || value[1] !== DEFAULT_AGE_RANGE[1])) {
                        acc[key] = value as [number, number];
                    } else if (key === 'expectedSalary' && value.length === 2 && (value[0] !== DEFAULT_SALARY_RANGE[0] || value[1] !== DEFAULT_SALARY_RANGE[1])) {
                        acc[key] = value as [number, number];
                    }
                } else if (key in acc) {
                    acc[key as keyof DemographicFilters] = value;
                }
            }
            return acc;
        }, {} as DemographicFilters);

        setFilters(cleanedFilters);
        onFilterChange(cleanedFilters);
    };

    // Clear all filters
    const clearFilters = () => {
        const emptyFilters: DemographicFilters = {};
        setFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    // Format currency for display
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Toggle section
    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Demographics</span>
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-96"
                align="end"
                sideOffset={5}
            >
                <div className="flex flex-col h-[600px]">
                    <div className="flex items-center justify-between p-2 border-b">
                        <DropdownMenuLabel className="text-base font-semibold">
                            Demographic Filters
                        </DropdownMenuLabel>
                        {activeFilterCount > 0 && (
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
                        <div className="space-y-4">
                            {/* Personal Information Section */}
                            <Collapsible open={openSections.personal} onOpenChange={() => toggleSection('personal')}>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">Personal Information</span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition-transform ${openSections.personal ? 'rotate-90' : ''}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-xs">First Name</Label>
                                            <Input
                                                id="firstName"
                                                placeholder="First Name"
                                                value={filters.firstName || ''}
                                                onChange={(e) => updateFilters({ ...filters, firstName: e.target.value || undefined })}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                placeholder="Last Name"
                                                value={filters.lastName || ''}
                                                onChange={(e) => updateFilters({ ...filters, lastName: e.target.value || undefined })}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            {/* Professional Information Section */}
                            <Collapsible open={openSections.professional} onOpenChange={() => toggleSection('professional')}>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        <span className="font-medium">Professional Information</span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition-transform ${openSections.professional ? 'rotate-90' : ''}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="text-xs">Department</Label>
                                        <Input
                                            id="department"
                                            placeholder="Department"
                                            value={filters.department || ''}
                                            onChange={(e) => updateFilters({ ...filters, department: e.target.value || undefined })}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            {/* Range Filters Section */}
                            <Collapsible open={openSections.ranges} onOpenChange={() => toggleSection('ranges')}>
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
                                    <div className="flex items-center gap-2">
                                        <Sliders className="h-4 w-4" />
                                        <span className="font-medium">Range Filters</span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition-transform ${openSections.ranges ? 'rotate-90' : ''}`} />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2 space-y-4">
                                    {/* Age Range */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs">Age Range</Label>
                                            <span className="text-xs text-muted-foreground">
                                                {filters.age?.[0] || DEFAULT_AGE_RANGE[0]} - {filters.age?.[1] || DEFAULT_AGE_RANGE[1]}
                                            </span>
                                        </div>
                                        <Slider
                                            defaultValue={filters.age || DEFAULT_AGE_RANGE}
                                            min={18}
                                            max={65}
                                            step={1}
                                            onValueChange={(value) => updateFilters({ ...filters, age: value as [number, number] })}
                                            className="my-2"
                                        />
                                    </div>

                                    {/* Expected Salary Range */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs">Expected Salary</Label>
                                            <span className="text-xs text-muted-foreground">
                                                {formatCurrency(filters.expectedSalary?.[0] || DEFAULT_SALARY_RANGE[0])} -
                                                {formatCurrency(filters.expectedSalary?.[1] || DEFAULT_SALARY_RANGE[1])}
                                            </span>
                                        </div>
                                        <Slider
                                            defaultValue={filters.expectedSalary || DEFAULT_SALARY_RANGE}
                                            min={0}
                                            max={200000}
                                            step={5000}
                                            onValueChange={(value) => updateFilters({ ...filters, expectedSalary: value as [number, number] })}
                                            className="my-2"
                                        />
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </ScrollArea>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DemographicFilterDropdown; 