import React from 'react';
import { Button, Box, Grid, Text, GridItem, Popover, PopoverTrigger,
PopoverContent, PopoverArrow, PopoverHeader, PopoverBody, Flex,
Table, Thead, Tr, Th, Td, Tbody, HStack} from '@chakra-ui/react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useState, useEffect, useCallback} from 'react'

const hours = ['7:00 am', '7:30 am', '8:00 am', '8:30 am', '9:00 am',
'9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am', '12:00 pm',
'12:30 pm', '1:00 pm', '1:30 pm', '2:00 pm', '2:30 pm', '3:00 pm', '3:30 pm',
'4:00 pm', '4:30 pm', '5:00 pm', '5:30 pm', '6:00 pm'];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function getHoursInRange(start, end){
    const startIndex = hours.indexOf(start);
    const endIndex = hours.indexOf(end);
    return hours.slice(startIndex, endIndex);
};

function roundDown(timeStr){
    const [time, period] = timeStr.split(" ")
    const [hours, minutes] = time.split(":")

    if(minutes === "10"){
        return `${hours}:00 ${period}`
    }
    else if(minutes === "40"){
        return `${hours}:30 ${period}`
    }
    else{
        return `${hours}:${minutes} ${period}`
    }
}

function AllSchedules(){
    const location = useLocation();
    const navigate = useNavigate();
    const [classList, setClassList] = useState({})
    const [studentList, setStudentList] = useState({})
    const {grid, officeHourQuant, officeHourLength, oncePerDay, classFile, 
        generatedClassFile, studentFile, generatedStudentFile, yourClasses} = location.state || {};
    const [notAvailableGrid] = useState(
        Array.from({ length: days.length }, () => Array.from({ length: hours.length }, () => []))
    );  
    const [availableGrid, setAvailableGrid]= useState(
        Array.from({ length: days.length }, () => Array.from({ length: hours.length }, () => []))
    );
    const [freeIndices, setFreeIndices] = useState({})
    const [combinations, setCombinations] = useState({})
    const [hoveredRowIndex, setHoveredRowIndex] = useState(null)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7
    
    const addStudentToGrid = useCallback((student, studentSchedule) => {
        Object.values(studentSchedule).forEach(entry => {
            const {course_day, course_start, course_end} = entry
            const hoursToShade = getHoursInRange(roundDown(course_start), roundDown(course_end));
            const daysArray = course_day.split(/(?=[A-Z])/).map(day => {
            switch (day) {
                case 'Mo': return 0; // Monday
                case 'Tu': return 1; // Tuesday
                case 'We': return 2; // Wednesday
                case 'Th': return 3; // Thursday
                case 'Fr': return 4; // Friday
                default: return -1;
            }
            });
            
            daysArray.forEach(dayIndex => {
            if (dayIndex >= 0) {
                hoursToShade.forEach(hour => {
                const hourIndex = hours.indexOf(hour);
                notAvailableGrid[dayIndex][hourIndex].push(student);
                });
            }
            });
        });
    }, [notAvailableGrid]);

    const getFreeIndices = useCallback(() => {
        const newIndices = {};
        grid.forEach((dayArray, dayIndex) => 
        {dayArray.forEach((hour, hourIndex) => {
            //for each day, find all indices which are valid office hour starts
            //i.e. it is available and can fit an officeHourQuant 
            let totalBlocks = officeHourLength * 2;
            //if it is marked as available (false)
            if(!grid[dayIndex][hourIndex] && hourIndex + totalBlocks < hours.length){
                //check next totalBlocks to make sure they are free
                let allTrue = true;
                for(let i = hourIndex; i < hourIndex + totalBlocks; i++){
                    if(grid[dayIndex][i]){
                        allTrue = false;
                        break;
                    }
                }   
                if(allTrue){
                    if(!newIndices[dayIndex]) {
                        newIndices[dayIndex] = [];
                    }
                    newIndices[dayIndex].push(hourIndex);
                }
            }
            
        })})
        setFreeIndices(newIndices)
    }, [grid, officeHourLength]);

    const studentSet = useCallback((dayIndex, hourIndex) => {
        let totalBlocks = officeHourLength * 2;
        const students = new Set();
        for(let i = hourIndex; i < hourIndex + totalBlocks; i++){
            for(let student of availableGrid[dayIndex][i]){
                students.add(student)
            }
        }
        return students
    }, [availableGrid, officeHourLength])

    
    function getCombinations(arr, n) {
        const result = [];
        
        function combine(prefix, start, k) {
            if (k === 0) {
                result.push(prefix);
                return;
            }
            for (let i = start; i <= arr.length - k; i++) {
                combine([...prefix, arr[i]], i + 1, k - 1);
            }
        }
        
        combine([], 0, n);
        return result;
    }
    
    function combineSets(obj, combination) {
        const combinedSet = new Set();
        combination.forEach(key => {
            obj[key].forEach(email => combinedSet.add(email));
        });
        return combinedSet;
    }

    function hasConflictingDays(combination){
        const numberMap = new Map();
        for(const tuple of combination){
            const first = tuple.split(',')[0];
            if(numberMap.has(first)){
                return true;
            }
            numberMap.set(first, true);
        }
        return false
    }

    function hasConflictingTimes(combination){
        const numberMap = {}
        for(const tuple of combination){
            const first = tuple.slice(1, -1).split(',')[0];
            const second = tuple.slice(1, -1).split(', ')[1];
            if(first in numberMap){
                for(const num of numberMap[first]){
                    if(Math.abs(num-second) < officeHourLength * 2 + 2){
                        return true
                    }
                }
                numberMap[first].push(second)
            }
            else{
                numberMap[first] = [second]
            }
        }
        return false
    }

    function calculateUniformity(combination){
        const second = combination.map(tuple => parseInt(tuple.slice(1, -1).split(', ')[1]));
        const maxSecond = Math.max(...second);
        const minSecond = Math.min(...second);
        const range = maxSecond - minSecond;
        return range;
    }
    
    const getTopCombinations = useCallback((obj, n, topCount) => {
        const keys = Object.keys(obj);
        const keyCombinations = getCombinations(keys, n);
    
        let combinationsWithCounts = keyCombinations.map(combination => {
            const combinedSet = combineSets(obj, combination);
            return {
                combination,
                uniqueCount: combinedSet.size,
                uniqueEmails: combinedSet,
                uniformity: calculateUniformity(combination)
            };
        });

        if(oncePerDay && combinationsWithCounts.length > 0){
            combinationsWithCounts = combinationsWithCounts.filter(({combination}) => 
            !hasConflictingDays(combination))
        }
        else if(!oncePerDay && combinationsWithCounts.length > 0){
            combinationsWithCounts = combinationsWithCounts.filter(({combination}) => 
            !hasConflictingTimes(combination))
        }
    
        // Sort by the uniqueCount in descending order, then breaks ties
        //by uniformity constant (how different the starting times are from eachother)
        combinationsWithCounts.sort((a, b) =>{ 
            if(b.uniqueCount !== a.uniqueCount){
                return b.uniqueCount - a.uniqueCount
            }
            else{
                return a.uniformity - b.uniformity
            }});
    
        // Get the top `topCount` combinations
        return combinationsWithCounts.slice(0, topCount);
    }, [oncePerDay])
    
    
    const calcBestIndices = useCallback((indices) => {
        const students = {}
        Object.entries(indices).forEach(([key, value]) => {
            value.forEach(hourIndex => (
                students[`(${key}, ${hourIndex})`] = studentSet(key, hourIndex)
            ))
            })
        return students
    }, [studentSet])
    
    function handleRowHover(index){
        setHoveredRowIndex(index + itemsPerPage * (currentPage - 1))
    }

    const totalPages = Math.ceil(Object.keys(combinations).length / itemsPerPage)
    const paginatedData = Object.keys(combinations).slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ).reduce((obj, index) => {
        obj[index] = combinations[index]
        return obj;
    }, {});

    function handlePreviousPage(){
        setCurrentPage((prev) => Math.max(prev-1, 1));
    }

    function handleNextPage(){
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    function handleCustomize(){
        navigate('/customize', {state: {grid, availableGrid, studentList, 
            officeHourQuant, officeHourLength, oncePerDay, classFile, 
            generatedClassFile, studentFile, generatedStudentFile, yourClasses}})
    }

    function handleReturn(){
        navigate('/my_schedule', {state: {yourClasses, classFile, generatedClassFile, 
            studentFile, generatedStudentFile}})
    }
    
    useEffect(() => {
        if(classFile){
            setClassList(classFile)
        }
        else if(generatedClassFile){
            setClassList(generatedClassFile)
        }
        if(studentFile){
            setStudentList(studentFile)
        }
        else if(generatedStudentFile){
            setStudentList(generatedStudentFile)
        }
    }, [classFile, generatedClassFile, studentFile, generatedStudentFile])
    
    useEffect(() => {
        if (Object.keys(studentList).length > 0 && Object.keys(classList).length > 0){
            Object.entries(studentList).forEach(([key, value]) => {
                let student = {schedule: {}};
                value.forEach((classCode) => {
                    student.schedule[classCode] = classList[classCode];
                })
                addStudentToGrid(key, student.schedule)
            });
            const available = notAvailableGrid.map((dayArray, dayIndex) => 
            dayArray.map((hourArray, hourIndex) => {
                return Object.keys(studentList).filter(item => !notAvailableGrid[dayIndex][hourIndex].includes(item))
            }))
            setAvailableGrid(available)
        }
    }, [classList, studentList, notAvailableGrid, addStudentToGrid])

    
    useEffect(() => {
        getFreeIndices()
    }, [getFreeIndices])

    useEffect(() => {
    
        if(Object.keys(freeIndices).length > 0){
            const topCombos = getTopCombinations(calcBestIndices(freeIndices), officeHourQuant, 300)
            setCombinations(topCombos)     
        }
    }, [freeIndices, officeHourQuant, getTopCombinations, calcBestIndices])

    const rowStyle = `
    &:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
    `;

    return(
        <Flex direction='row' h='100vh'>
            <Box display='flex' flexDirection='column'  w='50%' h='100%' 
            bg='#F4F3F3' boxShadow='base' overflow='scroll' p='20px 50px 0px 20px'>         
                <Grid templateColumns={`100px repeat(${days.length}, auto)`} w='100%' >
                    <GridItem colSpan={1} textColor='#626161'>
                        <Box h='27px'/>
                        {hours.slice(0, -1).map((hour, hIndex) => (
                            <Box key={hIndex} h='40px' p={2} textAlign="center"
                            fontWeight="bold" border="1px"
                            borderColor='#F4F3F3'
                            rowSpan={2}
                            >
                            {hour.includes(':30') || hour === '7:00 am' ? '' : hour}
                            </Box>
                            ))}
                    </GridItem>
                    {days.map((day, dayIndex) => (
                    <GridItem key={day} colSpan={1} minWidth='100px' textColor='#626161'>
                        <Box pt={2} pb={2} textAlign="center" fontWeight="bold"
                        borderLeft="3px" borderRight='4px' borderColor='#F4F3F3'>
                        <Text h='40px' p='10px' overflow='hidden'>{day}</Text>
                        {hours.slice(0, -1).map((hour, hourIndex) => {
                        const isHovered = hoveredRowIndex !== null && 
                        combinations[hoveredRowIndex]?.combination.some(combo => {
                            const [dIndex, hIndex] = combo.slice(1, -1).split(',').map(Number);
                            return dIndex === dayIndex && hIndex <= hourIndex && hourIndex <= hIndex + officeHourLength * 2 - 1
                        })
                        return(
                            <Box
                                key={hour}
                                h='40px'
                                p={2}
                                borderTop={hour.includes(':30') ? "none" : "2px"}
                                borderBottom={hour.includes(':30') ? "2px" : "none"}
                                borderColor='#F4F3F3'
                                bg={isHovered ? 'rgba(91, 145, 90, 0.9)' : (grid[dayIndex][hourIndex] ? 'rgba(220, 164, 164, 0.54)' : 'rgba(91, 145, 90, 0.54)')}
                                position='relative' color='white' textAlign='left' fontSize='12px'
                            >
                                <Box bg='rgba(0, 0, 0, 0.1)' display='inline-block'>
                                    {availableGrid[dayIndex][hourIndex].length}/{Object.keys(studentList).length}
                                </Box>
                                <Popover>
                                    <PopoverTrigger>
                                        <Button w='100%' h='100%' position='absolute' top='0px' left='0px' bg='none' 
                                        _hover={{bg:'rgba(0, 0, 0, 0.1)'}} borderRadius='0px'/>
                                    </PopoverTrigger>
                                    <PopoverContent h='200px' w='200px'overflow='scroll' color='black'>
                                        <PopoverArrow/>
                                        <PopoverHeader>{availableGrid[dayIndex][hourIndex].length}/{Object.keys(studentList).length} students available</PopoverHeader>
                                        <PopoverBody>
                                            {availableGrid[dayIndex][hourIndex].join('\n')}
                                        </PopoverBody>
                                    </PopoverContent>

                                </Popover>
                            </Box>
                        )})}
                        </Box>
                    </GridItem>
                    ))}
                </Grid>
            </Box>
            <Flex w='50%' justifyContent='center' alignItems='center' direction='column' gap='20px' p='50px' overflow='hidden'>
                <Box bg='#F4F3F3' minWidth='300px' h='65%' maxWidth='100%' minHeight='500px' borderRadius='30px' overflow='hidden' boxShadow='base' 
                p='50px' position='relative' pb='700px'>
                    <Text fontSize='25px' fontWeight='bold' fontFamily='inter' textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'
                        textColor='black' mb='10px' textAlign='center'>Possible Variations
                    </Text>
                    <Flex direction='row' justifyContent='space-between' fontWeight='bold' textColor='#626161'>
                        <Text textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'> {`Quantity: ${officeHourQuant}`}</Text>
                        <Text textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'> {`Length: ${officeHourLength} hours`}</Text>
                        <Text textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'> {`Once a day: ${oncePerDay ? '✓': '✗'}`}</Text>
                    </Flex>
                    <Box mt='40px' b='100px' overflow='auto' height='500px'>
                        <Table variant='simple' >
                            <Thead>
                                <Tr>
                                    <Th>Unique</Th>
                                    <Th>%</Th>
                                    {[...Array(officeHourQuant)].map(() => (
                                        <>
                                            <Th minWidth='100px'>Day</Th>
                                            <Th minWidth='130px'>Time</Th>
                                        </>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Object.values(paginatedData).map((combo, index) => {
                                    return (
                                        <Tr key={index + itemsPerPage * (currentPage - 1)} css={rowStyle} onClick={() => {console.log(combinations[index + itemsPerPage * (currentPage - 1)])}}
                                        onMouseEnter={() => handleRowHover(index)} onMouseLeave={() => setHoveredRowIndex(null)}>
                                            <Td borderBottom='1px' borderColor='#E8E8E8'>{combo.uniqueCount}</Td>
                                            <Td borderBottom='1px' borderColor='#E8E8E8'>{Math.round((combo.uniqueCount / Object.keys(studentList).length) * 100)}%</Td>
                                            {combo.combination.map((combo) => {
                                                const tuple = combo.slice(1, -1).split(",").map(Number)
                                                return(
                                                    <>
                                                        <Td borderBottom='1px' borderColor='#E8E8E8'>{days[tuple[0]]}</Td>
                                                        <Td borderBottom='1px' borderColor='#E8E8E8'>{`${hours[tuple[1]]}-${hours[tuple[1] + officeHourLength * 2]}`}</Td>
                                                    </>
                                                )
                                            })}
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    </Box>
                    <HStack spacing='4' justifyContent='center' mt='4' position='absolute' bottom='30px' 
                        left='50%' transform="translateX(-50%)">
                            <Button onClick={handlePreviousPage} isDisabled={currentPage === 1} bg='none'>Previous</Button>
                            <Text>Page {currentPage} of {totalPages}</Text>
                            <Button onClick={handleNextPage} isDisabled={currentPage === totalPages} bg='none'>Next</Button>
                    </HStack>
                </Box>
                <Flex w='100%' direction='row' justify='space-between'>
                <Button  bg='#F4F3F3' _hover={{bg:'rgba(0, 0, 0, 0.1)'}} color='gray'
                onClick={handleReturn} boxShadow='base'>
                    Return
                </Button>
                <Button bg='#F4F3F3' _hover={{bg:'rgba(0, 0, 0, 0.1)'}} color='gray'
                onClick={handleCustomize} boxShadow='base'>
                    Customize
                </Button>
                </Flex>
            </Flex>
        </Flex>
    );
}
export default AllSchedules;