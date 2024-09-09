import {useLocation, useNavigate} from 'react-router-dom';
import {Box, Button, Grid, GridItem, Text, useToast,
useDisclosure, Table, Thead, Tbody, Tr, Th, Td, Divider, Switch} from '@chakra-ui/react'
import {ArrowForwardIcon} from '@chakra-ui/icons'
import {useState, useEffect} from 'react'
import ClassOverlay from '../components/ClassOverlay';
import StudentOverlay from '../components/StudentOverlay';
import Schedule from '../components/Schedule';



function Home(){
    const location = useLocation();
    const {email, password} = location.state || {};
    const [term, setTerm] = useState(() => {
        const saved = localStorage.getItem('term');
        return saved ? JSON.parse(saved) : ''
    })
    const [classes, setClasses] = useState(() => {
        const saved = localStorage.getItem('classes');
        return saved !== undefined ? JSON.parse(saved) : false
    })
    const [classFile, setClassFile] = useState(() => {
        const saved = localStorage.getItem('classFile');
        return saved !== undefined ? JSON.parse(saved) : null
    })
    const [generatedClassFile, setGeneratedClassFile] = useState(() => {
        const saved = localStorage.getItem('generatedClassFile');
        return saved !== undefined ? JSON.parse(saved) : null
    })
    const [yourClasses, setYourClasses] = useState(() => {
        const saved = localStorage.getItem('yourClasses');
        return saved ? JSON.parse(saved) : {}})

    const [students, setStudents] = useState(() => {
        const saved = localStorage.getItem('students');
        return saved !== undefined ? JSON.parse(saved) : false
    })
    const [studentFile, setStudentFile] = useState(() => {
        const saved = localStorage.getItem('studentFile');
        return saved !== undefined ? JSON.parse(saved) : null
    })
    const [generatedStudentFile, setGeneratedStudentFile] = useState(() => {
        const saved = localStorage.getItem('generatedStudentFile');
        return saved !== undefined ? JSON.parse(saved) : null
    })
    const [scheduler, setScheduler] = useState(false)
    const {isOpen: isOpenClass, onOpen: onOpenClass, onClose: onCloseClass} = useDisclosure()
    const {isOpen: isOpenStudent, onOpen: onOpenStudent, onClose: onCloseStudent} = useDisclosure()
    const [headless, setHeadless] = useState(false)
    const [generating, setGenerating] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    function handleClassClick(){
        if(classes){
            if(classFile){
                navigate('/classes', {state: {classFile}});
            }
            else if(generatedClassFile){
                navigate('/classes', {state: {generatedClassFile}})
            }
        }
        else{
            onOpenClass()
        }
    }
    function handleStudentClick(){
        if(!classes){
            toast({
                title: "Please generate class information first.",
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom',
            })
        }
        else if(students){
            if(studentFile){
                navigate('/students', {state: {studentFile}});
            }
            else if(generatedStudentFile){
                navigate('/students', {state: {generatedStudentFile}});
            }
        }
        else{
            onOpenStudent();
        }
    }

    function handleScheduleClick(){
        if(students && classes){
            if(studentFile && classFile){
                navigate('/my_schedule', {state: {yourClasses, classFile, studentFile}})}
            else if(studentFile && generatedClassFile){
                navigate('/my_schedule', {state: {yourClasses, generatedClassFile, studentFile}})}
            else if(generatedStudentFile && classFile){
                navigate('/my_schedule', {state: {yourClasses, classFile, generatedStudentFile}})}}
            else if(generatedStudentFile && generatedClassFile){
                navigate('/my_schedule', {state: {yourClasses, generatedClassFile, generatedStudentFile}});
            }
        else{
            toast({
                title: "Please generate both class and student information first.",
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom',
            })
        }
    }

    function handleReset(){
        setTerm('');
        setClasses(false);
        setClassFile(null);
        setGeneratedClassFile(null);
        setYourClasses({})
        setStudents(false);
        setStudentFile(null);
        setGeneratedStudentFile(null)
        setGenerating(false)
    }

    useEffect(()=> {
        localStorage.setItem('term', JSON.stringify(term));
    },[classes])
    useEffect(()=> {
        localStorage.setItem('classes', JSON.stringify(classes));
    },[classes])
    useEffect(()=> {
        localStorage.setItem('classFile', JSON.stringify(classFile));
    },[classFile])
    useEffect(()=> {
        localStorage.setItem('generatedClassFile', JSON.stringify(generatedClassFile));
    },[generatedClassFile])
    useEffect(()=> {
        localStorage.setItem('yourClasses', JSON.stringify(yourClasses));
    },[yourClasses])
    useEffect(()=> {
        localStorage.setItem('students', JSON.stringify(students));
    },[students])
    useEffect(()=> {
        localStorage.setItem('studentFile', JSON.stringify(studentFile));
    },[studentFile])
    useEffect(()=> {
        localStorage.setItem('generatedStudentFile', JSON.stringify(generatedStudentFile));
    },[generatedStudentFile])

    
    

    return (
        <Box>
            <Box w='100%' pt='40px' pr='40px' display='flex' flexDirection='row' justifyContent='flex-end' gap='30px'>
                <Button w='80px' bg='#F4F3F3'onClick={handleReset}>Reset</Button>
                <Box display='flex' flexDirection='row' gap='5px' alignItems='center'>
                    <Switch size='lg' onChange={() => setHeadless(prev => !prev)}
                    checked={headless}/>
                    <Text fontWeight='bold'>Headless Mode</Text>
                </Box>
            </Box>
            <Grid h='300px'
            templateRows='repeat(3, 1fr)'
            templateColumns='repeat(12, 1fr)'
            gap='40px' p='40px'
            >
            <GridItem rowSpan={1} colSpan={4} bg={classes ? 'rgba(91, 145, 90, 0.54)' : '#F4F3F3'}
            borderRadius='30px' p='60px' boxShadow='base'>
                <Text fontSize='25px' fontWeight='bold' fontFamily='inter'
                textColor={classes ? '#FFFFFF' : '#000000'} mb='10px'>Class Information</Text>
                <Text fontFamily='inter'  mb='10px' textColor={classes ? '#FFFFFF' : '#626161'}>
                    Grab class information including class time and days of week.
                </Text>
                <Text fontFamily='inter' fontSize='15px' textColor={classes ? '#FFFFFF' : '#A2A2A2'}
                mb='60px'>
                    *Estimated duration: 7 minutes
                </Text>
                <Button bg='none' _hover={{bg:'none'}} w='70px' h='70x' onClick={handleClassClick}>
                    <ArrowForwardIcon boxSize='70px' color={classes ? 'white' : 'blackAlpha.500'}
                        _hover={{color: classes ? 'gray.100' : 'blackAlpha.600'}}/>
                </Button>
            </GridItem>
            <GridItem rowSpan={1} colSpan={4} bg={students ? 'rgba(91, 145, 90, 0.54)' : '#F4F3F3'}
            borderRadius='30px' p='60px'  boxShadow='base'>
                <Text fontSize='25px' fontWeight='bold' fontFamily='inter'
                textColor={students ? '#FFFFFF' : '#000000'} mb='10px'>Student Information</Text>
                <Text fontFamily='inter' mb='10px' textColor={students ? '#FFFFFF' : '#626161'}>
                    Grab information of students enrolled in your classes.
                </Text>
                <Text fontFamily='inter' fontSize='15px' textColor={students ? '#FFFFFF' : '#A2A2A2'}>
                    *Estimated duration: 5 minutes
                </Text>
                <Text fontFamily='inter' fontSize='15px' textColor={students ? '#FFFFFF' : '#A2A2A2'}
                mb='60px'>
                    *Class information must be complete first
                </Text>
                <Button bg='none' _hover={{bg:'none'}} w='70px' h='70x'>
                    <ArrowForwardIcon boxSize='70px' color={students ? 'white' : 'blackAlpha.500'} onClick={handleStudentClick}
                    _hover={{color: classes ? (students ? 'gray.100' : 'blackAlpha.600') : 'blackAlpha.500' }}/>
                </Button>
            </GridItem>
            <GridItem rowSpan={1} colSpan={4} bg={scheduler ? 'rgba(91, 145, 90, 0.54)' : '#F4F3F3'}
            borderRadius='30px' p='60px' boxShadow='base'>
                <Text fontSize='25px' fontWeight='bold' fontFamily='inter'
                textColor={scheduler ? '#FFFFFF' : '#000000'} mb='10px'>Scheduler</Text>
                <Text fontFamily='inter' mb='10px' textColor={scheduler ? '#FFFFFF' : '#626161'}>
                    Schedule the best time for office hours.
                </Text>
                <Text fontFamily='inter' fontSize='15px' textColor={scheduler ? '#FFFFFF' : '#A2A2A2'}
                mb='60px'>
                    *Class information and student information must be complete first
                </Text>
                <Button bg='none' _hover={{bg:'none'}} w='70px' h='70x'>
                    <ArrowForwardIcon boxSize='70px' color={scheduler ? 'white' : 'blackAlpha.500'}
                    _hover={{color : classes ? (students ? (scheduler ? 'gray.100' : 'blackAlpha.600') : 
                    'blackAlpha.500') : 'blackAlpha.500'}} onClick={handleScheduleClick}/>
                </Button>
            </GridItem>
            <GridItem rowSpan={1} colSpan={12} bg='#F4F3F3'
            borderRadius='30px' p='60px' boxShadow='base'>
                <Text fontSize='25px' fontWeight='bold' fontFamily='inter'
                textColor='#000000' mb='10px'>My Classes</Text>
                <Divider borderWidth='1px' borderColor='#A2A2A2'/>
                <Table variant='simple' style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <Thead>
                                <Tr>
                                    <Th w='10%'>Course Code</Th>
                                    <Th w='30%'>Course Name</Th>
                                    <Th w='10%'>Course Number</Th>
                                    <Th w='10%'>Course End</Th>
                                    <Th w='10%'>Course Day</Th>
                                    <Th w='10%'>Course Start</Th>
                                    <Th w='15%'>Course Instructor</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Object.keys(yourClasses ?? {}).map(courseCode => {
                                    const { course_name, course_number, course_day, course_start, 
                                        course_end, course_instructor } = yourClasses[courseCode];
                                    return (
                                        <Tr key={courseCode}>
                                            <Td w='10%'>{courseCode}</Td>
                                            <Td w='30%'>{course_name}</Td>
                                            <Td w='10%'>{course_number}</Td>
                                            <Td w='10%'>{course_day}</Td>
                                            <Td w='10%'>{course_start}</Td>
                                            <Td w='10%'>{course_end}</Td>
                                            <Td w='15%'>{course_instructor}</Td>
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
            </GridItem>
            {classes && Object.keys(yourClasses).length > 0 &&
            (<GridItem rowSpan={1} colSpan={6} bg='#F4F3F3'
                borderRadius='30px' p='60px' boxShadow='base'>
                    <Text fontSize='25px' fontWeight='bold' fontFamily='inter'
                    textColor='#000000' mb='10px'>Your Schedule</Text>
                    <Schedule schedule={yourClasses}/>
            </GridItem>)}
        </Grid>

        <ClassOverlay isOpen={isOpenClass} onClose={onCloseClass} classFile={classFile}
        setClasses={setClasses} setClassFile={setClassFile} generatedClassFile={generatedClassFile}
        setGeneratedClassFile={setGeneratedClassFile} email={email} password={password} setTerm={setTerm}  headless={headless}
        term={term} yourClasses={yourClasses} setYourClasses={setYourClasses}/>
        <StudentOverlay isOpen={isOpenStudent} onClose={onCloseStudent} studentFile={studentFile}
        setStudents={setStudents} setStudentFile={setStudentFile} generatedStudentFile={generatedStudentFile}
        setGeneratedStudentFile={setGeneratedStudentFile} email={email} password={password} term={term}
        yourClasses={yourClasses} headless={headless} generating={generating} setGenerating={setGenerating}/>
      </Box>
    )
}
export default Home;