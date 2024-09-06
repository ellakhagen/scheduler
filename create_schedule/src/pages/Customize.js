import React, {useEffect, useState} from 'react';
import { Box, Grid, Text, GridItem, Flex, CircularProgress, 
    CircularProgressLabel, Button} from '@chakra-ui/react';
import {useLocation, useNavigate} from 'react-router-dom';


const hours = ['7:00 am', '7:30 am', '8:00 am', '8:30 am', '9:00 am',
'9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am', '12:00 pm',
'12:30 pm', '1:00 pm', '1:30 pm', '2:00 pm', '2:30 pm', '3:00 pm', '3:30 pm',
'4:00 pm', '4:30 pm', '5:00 pm', '5:30 pm', '6:00 pm'];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];


function Customize(){
    const location = useLocation();
    const navigate = useNavigate();

    const {grid, availableGrid, studentList, officeHourQuant, officeHourLength, 
        oncePerDay, classFile, generatedClassFile, studentFile, 
        generatedStudentFile, yourClasses} = location.state || {};
    const [customGrid, setCustomGrid] = useState(Array.from({ length: days.length }, 
        () => Array.from({ length: hours.length }, () => [false])))
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [students, setStudents] = useState(0)
    const [progress, setProgress] = useState(0.5)
    const [percent, setPercent] = useState(0)

    function handleMouseDown(dayIndex, hourIndex){
        setIsMouseDown(true);
        toggleGrid(dayIndex, hourIndex)
    };

    function handleMouseOver(dayIndex, hourIndex){
        if(isMouseDown){
            toggleGrid(dayIndex, hourIndex)
        }
    }
    function toggleGrid(dayIndex, hourIndex){
        setCustomGrid(prevGrid => {
            const newGrid = prevGrid.map(row => [...row]);
            newGrid[dayIndex][hourIndex] = !prevGrid[dayIndex][hourIndex];
            return newGrid;
        });
    };

    function handleRecommendations(){
        navigate('/calc_time', {state: {grid, officeHourQuant, officeHourLength, oncePerDay, classFile, 
            generatedClassFile, studentFile, generatedStudentFile, yourClasses}})
    }

    useEffect(() => {
        const studentSet = new Set()
        customGrid.forEach((dayArray, dayIndex) => {
            dayArray.forEach((hour, hourIndex) => {
                if(!customGrid[dayIndex][hourIndex]){
                    availableGrid[dayIndex][hourIndex].forEach(s => {
                        studentSet.add(s)
                    })
                }
            }) 
        })
        setStudents(Array.from(studentSet))
    }, [customGrid, availableGrid])

    useEffect(() => {
        setProgress(Math.max(0.5, Math.floor((students.length / Object.keys(studentList).length) * 100)))
        setPercent(Math.floor(((students?.length || 0) / Object.keys(studentList).length) * 100))
    }, [students, studentList])
    

    return (
        <Flex flexDirection='row'>
            <Box display='flex' flexDirection='column' userSelect='none' w='50%' h='100vh' 
            bg='#F4F3F3' boxShadow='base' overflow='scroll' p='20px 50px 0px 20px'>
                
                <Grid templateColumns={`100px repeat(${days.length}, auto)`} w='100%' textColor='#626161'>
                    <GridItem colSpan={1}>
                        <Box h='27px'/>
                        {hours.slice(0, -1).map((hour, index) => (
                            <Box key={index} h='40px' p={2} textAlign="center"
                            fontWeight="bold" border="1px"
                            borderColor='#F4F3F3'
                            rowSpan={2}
                            >
                            {/* Check if hour ends with ':30' or is '7:00 am' */}
                            {hour.includes(':30') || hour === '7:00 am' ? '' : hour}
                            </Box>
                            ))}
                    </GridItem>
                    {days.map((day, dayIndex) => (
                    <GridItem key={day} colSpan={1} minWidth='100px'>
                        <Box pt={2} pb={2} textAlign="center" fontWeight="bold"
                        borderLeft="3px" borderRight='4px' borderColor='#F4F3F3'>
                        <Text h='40px' p='10px' overflow='hidden'>{day}</Text>
                        {hours.slice(0, -1).map((hour, hourIndex) => (
                        <Box
                            key={hour}
                            h='40px'
                            p={2}
                            borderTop={hour.includes(':30') ? "none" : "2px"}
                            borderBottom={hour.includes(':30') ? "2px" : "none"}
                            borderColor='#F4F3F3'
                            bg={customGrid[dayIndex][hourIndex] ? (grid[dayIndex][hourIndex] 
                            ? 'rgba(220, 164, 164, 0.54)' : 'rgba(91, 145, 90, 0.54)') : 'rgba(91, 145, 90, 0.9)'}
                            textAlign="left" color='white' fontSize='12px'
                            onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
                            onMouseEnter={() => handleMouseOver(dayIndex, hourIndex)}
                            onMouseUp={() => setIsMouseDown(false)}
                        >
                            <Box bg='rgba(0, 0, 0, 0.1)' display='inline-block'>
                                {availableGrid[dayIndex][hourIndex].length}/{Object.keys(studentList).length}
                            </Box>
                        </Box>
                        ))}
                        </Box>
                    </GridItem>
                    ))}
                </Grid>
            </Box>
            <Flex w='50%' justifyContent='center' alignItems='center' direction='column' gap='30px' p='50px'>
                <Flex direction='column'>
                    <Text fontSize='25px' fontWeight='bold' fontFamily='inter' textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'
                            textColor='black' mb='10px' textAlign='center'>Customize
                    </Text>
                    <Text fontFamily='inter' textColor='#A2A2A2' textAlign='center' fontSize='20px' fontWeight='bold'
                        textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'>
                        Check total student availability by clicking your preferred times on the schedule.
                    </Text>
                </Flex>
                <CircularProgress size='400px' value={progress} color='rgba(91, 145, 90, 0.54)'>
                    <CircularProgressLabel textColor='#A2A2A2' fontWeight={'bold'}>
                        {percent}%</CircularProgressLabel>
                </CircularProgress>
                <Flex width='100%' h='90px' bg='#F2F2F2' p='20px' alignItems='center' boxShadow='base'
                borderRadius='20px' fontSize='30px' fontFamily='inter' fontWeight='bold' textColor='#A2A2A2'>
                    {students.length} {students === 1 ? 'student' : 'students'} available
                </Flex>
                <Flex width='100%' h='90px' bg='#F2F2F2' p='20px' alignItems='center' boxShadow='base'
                borderRadius='20px' fontSize='30px' fontFamily='inter' fontWeight='bold' textColor='#A2A2A2'
                onClick={() => (console.log(Object.keys(studentList).filter((student) => !students.includes(student))))}>
                    {Object.keys(studentList).length - students.length} 
                    {Object.keys(studentList).length - students.length === 1 ? 
                    ' student' : ' students'} not available
                </Flex>
                <Button alignSelf='flex-start' bg='#F4F3F3' _hover={{bg:'rgba(0, 0, 0, 0.1)'}}
                 boxShadow='base' color='gray' onClick={handleRecommendations}>
                    Recommendations
                </Button>
            </Flex>
        </Flex>
    );
  };
  
  export default Customize;